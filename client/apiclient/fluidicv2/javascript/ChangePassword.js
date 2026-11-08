//$Id$
Ember.Handlebars.registerHelper('ifCond', function(a, b, options) {//No I18N
    return Ember.Handlebars.bind.call(options.contexts[0], a, options, true, function(result) {
        return result === b;
    });
});
window.ITOMClient = Ember.Application.create();
window.OPM = {apiclientVersion: "fluidicv2"}; //No I18n


ITOMClient.Router.map(function() {
    this.resource('ChangePwd', { path: '/' }); //No I18n
});

ITOMClient.ChangePwdRoute = Ember.Route.extend({
});

ITOMClient.ChangePwdController = Ember.Controller.extend({
    passwordSuccess: false,
    newPassword: '',
    confirmNewPassword: '',
    passwordPolicy: passwordPolicy,
    inputType: 'password', //No I18n
    inputTypeConf: 'password', //No I18n
    productName: productName,
    criteriaValid: false,
    isValidAuth: isValidAuth,
    authMessage: authMessage,
    i18nContactAdmin:i18nContactAdmin,
    i18nCancel:i18nCancel,
    i18nTryAgain:i18nTryAgain,
    actions: {
        submitPwd: function() {
            var self = this;
            var newPassword = this.get('newPassword');
            var formdata = new FormData()
            formdata.append("newPassword", newPassword); //No I18n
            formdata.append("userUID", userUID); //No I18n
            this.set("tempBlock", true); //No I18n
            $.ajax({
                type: "POST", //No I18n
                url: "/user/changePassword?action=changePassword", //No I18n
                processData: false,
                contentType: false,
                data: formdata,
                success: function(response) {
                    self.set("tempBlock", false); //No I18n
                    if(response.error) {
                        self.set("errorMsg", response.error.message); //No I18n
                    }
                    else if(response.status === "Success"){
                        self.set("passwordSuccess", true); //No I18n
                    }
                }
            });
        },
        cancelChange: function() {
            window.close();
        },
        loginNew: function() {
            location.href = "/";
        },
        revealPass: function(type) {
            if(type === "confirm") {
                this.set("inputTypeConf", this.get("inputTypeConf") === "password" ? "input" : "password" ); //No I18n
            }
            else if(type === "new") {
                this.set("inputType", this.get("inputType") === "password" ? "input" : "password" ); //No I18n
            }
        },
        redirectForgot: function() {
            location.href = "/apiclient/ember/Login.jsp?redirectForgotPwdPage=true";
        }
    }
});

ITOMClient.ChangePwdView = Ember.View.extend({
    didInsertElement: function() {
        svg4everybody();
    },
    keyUp: function (e) {
        var passResult = false, confirmPassResult = false;
        if ($('#changePassword_confirmPassword').is(':focus')) {
            var password = this.get('controller.newPassword');
            passResult = isValidPwd(password);
            passwordCheck(passResult);
            if(this.get('controller.confirmNewPassword').length && this.get('controller.newPassword') !== this.get('controller.confirmNewPassword')) {
                this.set('controller.errorMsg', Ember.I18n.t("webclient.login.changepass.nomatchpass")); //No I18n
                confirmPassResult = false;
            }
            else {
                this.set('controller.errorMsg', "");
                confirmPassResult = true;
            }
            if(passResult.result && confirmPassResult) {
                this.set('controller.criteriaValid', true); //No I18n
            }
            else {
                this.set('controller.criteriaValid', false); //No I18n
            }
        }
    }
});

function isValidPwd(pwd) {
    var pwdMinLen = passwordPolicy.minLength;
    var pwdMaxLen = passwordPolicy.maxLength;
    var sameUsrPwd = userName; 
    var complexPwd = true;
    var obj = {
        'result': true, //No I18N
        'emptyCheck': true, //No I18N
        'minLen': true, //No I18N
        'maxLen': true, //No I18N
        'upperChar': false, //No I18N
        'lowerChar': false, //No I18N
        'specialChar': false, //No I18N
        'usrPwdEql': false //No I18N
    };
    if (pwd === undefined || pwd === '') {
        obj.emptyCheck = obj.minLen = obj.maxLen = obj.result = false;
    } else {
        if (pwd.length < pwdMinLen) {
            obj.minLen = obj.result = false;
        }
        if (pwd.length < 1 || pwd.length > pwdMaxLen) {
            obj.maxLen = obj.result = false;
        }
        if (passwordPolicy.loginName_indepndt && sameUsrPwd !== undefined && sameUsrPwd === pwd) {
            obj.usrPwdEql = true;
            obj.result = false;
        }
        if (complexPwd === true) {
            var anUpperCase = /[A-Z]/;
            var aLowerCase = /[a-z]/;
            var aSpecial = /[~`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
            for (var i = 0; i < pwd.length; i++) {
                if (anUpperCase.test(pwd[i])) {
                    obj.upperChar = true;
                }
                else if (aLowerCase.test(pwd[i])) {
                    obj.lowerChar = true;
                }
                else if (aSpecial.test(pwd[i])) {
                    obj.specialChar = true;
                }
            }
            if (
                obj.upperChar === false ||
                obj.lowerChar === false ||
                obj.specialChar === false
            ) {
                obj.result = false;
            }
        }
    }
    return obj;
}

function passwordCheck(result) {
    if (result.usrPwdEql !== true) { $('#policy_username').addClass('active'); } else { $('#policy_username').removeClass('active'); }
    if (result.minLen === true) { $('#policy_minimum').addClass('active'); } else { $('#policy_minimum').removeClass('active'); }
    if (result.maxLen === true) { $('#policy_maximun').addClass('active'); } else { $('#policy_maximun').removeClass('active'); }
    if (result.specialChar === true) { $('#policy_special').addClass('active'); } else { $('#policy_special').removeClass('active'); }
    if (result.upperChar === true) { $('#policy_upper').addClass('active'); } else { $('#policy_upper').removeClass('active'); }
    if (result.lowerChar === true) { $('#policy_lower').addClass('active'); } else { $('#policy_lower').removeClass('active'); }
}
