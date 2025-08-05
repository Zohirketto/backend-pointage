let Global = {
        REGEXPS: {
                regexBL : /C\d{3}-F\d{6}-\d{2}/,
                regexCas : /C\d{3}-F\d{6}/,
        },

        ENUMS: {
                enumEtapesFixe : [
                        "Accueil",
                        "Salle sculpture",
                        "Salle céramique",
                        "Scan fixe",
                ],

                enumEtapesAmovible: [
                        "Accueil",
                        "Scan amovible",
                        "Stellite",
                        "Montage",
                ],

        },

        TEINTES: {
                A1:"A1",A2:"A2",A3:"A3","A3,5":"A3,5",A4:"A4",
                B1:"B1",B2:"B2",B3:"B3",B4:"B4",C1:"C1",
                C2:"C2", C3:"C3", C4:"C4",D1:"D1", D2:"D2",D3:"D3", D4:"D4",
                BL1:"BL1", BL2:"BL2", BL3:"BL3", BL4:"BL4",
                Aucune:"Aucune"
        },

        ROLES : {
                sAdmin: 'sAdmin',
                Admin: 'Admin',
                Secretaire: 'Secretaire',
                Invite: 'Invité',
                Client: 'Client'

        }
}

module.exports = Global