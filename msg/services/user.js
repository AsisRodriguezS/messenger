'use strict';

module.exports = class User {
    constructor(psid) {
        this.psid = psid;
        this.firstName = '',
        this.lastName = '';
        this.locale = '';
        this.timezone= '';
        this.gender = 'neutral';
        this.servicio = '';
        this.proyecto = '';
        this.nombreProyecto = '';
        this.email = '';
        this.tel = '';
    }
    setProfile(profile) {
        this.firstName = profile.firstName;
        this.lastName = profile.lastName;
        this.locale = profile.locale;
        this.timezone = profile.timezone;
        if (profile.gender) {
            this.gender = profile.gender;
        }
    }
};