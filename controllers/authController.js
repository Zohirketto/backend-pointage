const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Your User model

// Middleware to secure routes based on authentication
exports.secured = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // If not authenticated, send 401 and indicate not logged in
    res.status(401).json({
        status: false,
        error: "Not logged in"
    });
    // Do not throw a string after sending a response; let the client handle the 401
    // If you want to log or handle this internally, use next(new Error("not logged in")) for error middleware
};

// Middleware to secure routes for Admin role
exports.securedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.role === "admin") {
            console.log(); // DEBUG: Log access
            return next();

        } else {
            // If authenticated but not authorized (wrong role), send 403 Forbidden
            return res.status(403).json({
                status: false,
                error: "Not authorized. Admin access required."
            });
        }
    } else {
        // If not authenticated, send 401 Unauthorized
        res.status(401).json({
            status: false,
            error: "Not logged in"
        });
    }
};

// Middleware to secure routes for Secretaire, Admin, or Client roles
exports.securedPointer = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.role === "pointer" || req.user.role === "admin" ) {
            return next();
        } else {
            // If authenticated but not authorized (wrong role), send 403 Forbidden
            return res.status(403).json({
                status: false,
                error: "Not authorized. Secretaire, Admin, or Client access required."
            });
        }
    } else {
        // If not authenticated, send 401 Unauthorized
        res.status(401).json({
            status: false,
            error: "Not logged in"
        });
    }
};



// User login function
exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        console.log(`[Login Attempt] Username: ${username}, Password (plain): ${password}`); // DEBUG: Log incoming credentials

        if (!username || !password) {
            console.log('[Login Error] Username or password missing.'); // DEBUG
            return res.status(400).json({
                status: false,
                error: 'Username and password are required',
            });
        }

        const user = await User.findOne({ username });

        if (!user) {
            console.log(`[Login Error] User '${username}' not found.`); // DEBUG
            return res.status(404).json({
                status: false,
                error: 'User not found',
            });
        }

        console.log(`[Login Info] Found user: ${user.username}, Role: ${user.role}`); // DEBUG
        console.log(`[Login Info] Stored Password (WARNING: Likely plain-text now): ${user.password}`); // DEBUG: Log the password from DB

        // --- START OF MODIFICATION: Removed bcrypt and replaced with direct comparison ---
        const isMatch = await bcrypt.compare(password, user.password); // Direct comparison of plain-text passwords
        console.log(`[Login Info] Direct password comparison result: ${isMatch}`); // DEBUG: See the comparison result
        // --- END OF MODIFICATION ---

        if (!isMatch) {
            console.log('[Login Error] Invalid password.'); // DEBUG
            return res.status(401).json({
                status: false,
                error: 'Invalid username or password',
            });
        }

        console.log('[Login Success] Password matched. Attempting req.login...'); // DEBUG

        // Use Passport's req.login for session management if Passport is used
        req.login(user, (err) => {
            if (err) {
                console.error("Passport login error:", err); // DEBUG
                return next(err);
            }

            console.log('[Login Success] req.login successful.'); // DEBUG
            res.status(200).json({
                status: true,
                message: 'Login successful',
                user: {
                    username: user.username,
                    role: user.role,
                },
            });
        });

    } catch (err) {
        console.error("Login error (catch block):", err); // DEBUG
        next(err);
    }
};

// ... (rest of your logout and isloggedin functions)

// handle logout
exports.logout = (req, res, next) => { // Added `next` for error handling
    // Passport's req.logout method handles session destruction
    req.logout((err) => { // Corrected: req.logout() takes a callback
        if (err) {
            console.error("Logout error:", err);
            return next(err); // Pass error to Express error handler
        }
        // Clear the session cookie and respond
        res.status(200).clearCookie('connect.sid', {
            path: '/'
        }).json({
            status: true,
            message: "Logged out successfully"
        });
    });
};

// Check if user is logged in
exports.isloggedin = (req, res) => {
    try {
        if (req.isAuthenticated()) {
            // Only send necessary user data, avoid sending the entire req.user object directly
            const userData = {
                username: req.user.username,
                role: req.user.role,
                // Add other non-sensitive data you want to expose
            };
            res.status(200).json({
                status: true,
                data: userData
            });
        } else {
            res.status(200).json({ // 200 is fine if you're just reporting status, 401 if it's an "access denied" check
                status: false,
                data: "0" // Or null, or an empty object, "0" is a bit unusual
            });
        }
    } catch (err) {
        console.error("isloggedin error:", err);
        res.status(500).json({
            status: false,
            error: "Server error checking login status"
        });
    }
};


exports.signup = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        status: false,
        error: 'Username, password, and role are required',
      });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        status: false,
        error: 'Username already exists',
      });
    }

    const newUser = new User({
      username,
      password,
      role,
    });

    await newUser.save();

    res.status(201).json({
      status: true,
      message: 'User created successfully',
      user: {
        username: newUser.username,
        role: newUser.role,
        hach: newUser.hach,
        // password is intentionally excluded
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({
      status: false,
      error: 'Server error during signup',
    });
  }
};


exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'username role'); // Only return username and role
        res.status(200).json({
            status: true,
            data: users
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({
            status: false,
            error: "Server error fetching users"
        });
    }
}

// DELETE /api/auth/delete/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ status: false, error: 'User not found' });
    }

    res.status(200).json({
      status: true,
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ status: false, error: 'Server error during deletion' });
  }
};
// PUT /api/auth/update/:id

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, role, password } = req.body;

    const updates = {};

    if (username) updates.username = username;
    if (role) updates.role = role;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ status: false, error: 'User not found' });
    }

    res.status(200).json({
      status: true,
      message: 'User updated successfully',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username, // no hashing needed here
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ status: false, error: 'Server error during update' });
  }
};