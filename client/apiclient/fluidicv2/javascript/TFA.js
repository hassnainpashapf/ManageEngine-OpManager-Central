if(totpAppNotConfigured!==null &&totpAppNotConfigured!==undefined && totpAppNotConfigured)
{
    function qrKeyToggle(){
        $('#qrKeyDiv').toggle();
        $('#manualKeyDiv').toggle();
    }
    function revealQrCode() {
        $('.filter-image').addClass("active");
        $("#revealDiv").hide();
        $("#scanToConfigDiv").show();
    }
    function logoutNewUser() {
        $('form[name="tfaForm"] input[type="password"]').remove();
        $('form[name="tfaForm"]').attr('action', 'two_factor_auth'); //No I18n
        $('input[name="j_username"]').val(Date.now()); //No I18n
        $('form[name="tfaForm"]').submit();
    }
    function handleOTPPaste(e) {
        var pastedData = (e.clipboardData || window.clipboardData).getData('text');//No I18n
        e.preventDefault();
        var inputFields = $('.OTPinput input');
        if (pastedData.length !== inputFields.length) { return }; //Prevent if not same length
        var regex = new RegExp("^[0-9]+$"); //Only numbers allowed
        if (!regex.test(pastedData)) { 
            e.preventDefault();
            return false;
        }
        inputFields.each(function(input, index) {
            $(this).focus();
            $(this).val(pastedData[input]);
        });
    }
    $(document).ready(function() {
        $('#productMail').text(supportEmail);
        $('#productMail').attr('href', 'mailto:' + supportEmail);
        $('.fab').off().on('click', function(event) {
            event.stopPropagation();
            var stepName = $(this).data('stepname'); //No I18n                  
            if(stepName !== 'verification') {
                if(stepName === 'keyRegister') {
                    setTimeout(function(){$('#otpField1').focus();},100);
                }
                $('.step').removeClass('active');
                $('#' + stepName + 'Div').next().addClass('active');
                $('.step__header').removeClass('defaultPointer');
                $('#' + stepName + 'Div').nextAll().children('.step__header').addClass('defaultPointer');
            }
            else {
                var otp = $('.OTPinput input').map(function(){return $(this).val()}).get().join("");
                if(otp.length < 6) {
                    alert(incorrectOtpLenMsg); 
                    return;
                }
                if($('input[name="j_username"]').val() == "null") {
                    $('input[name="j_username"]').remove();
                }
                $('#password').val(otp);
                document.tfaForm.submit();
            }
        });
        $('.step').off().on('click', function() {
            if($(this).hasClass('active') || $(this).prevAll().hasClass('active')) {
                return;
            }
            $('.step').removeClass('active');
            $(this).addClass('active');
            $('.step__header').removeClass('defaultPointer');
            $(this).nextAll().children('.step__header').addClass('defaultPointer'); //No I18n
        });
        $('.OTPinput input').on('keypress', function(e){                    
            if(e.keyCode == 13) { //Enter Key
                if(!$('#verificationDiv div.fab').hasClass('disabledBlock')){
                    $('#verificationDiv div.fab').trigger('click');  //No I18n
                }
                return;
            }
            else if(e.keyCode == 8) {
                if(!$(this).val()) {
                    $(this).prev('input').focus(); //No I18n
                }
            }
            else {
                var regex = new RegExp("^[0-9]+$");
                var key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
                if (!regex.test(key)) {
                    e.preventDefault();
                    return false;
                }
                $(this).on('keyup', function() {
                    $(this).next('input').focus(); //No I18n
                    $(this).off('keyup'); //No I18n
                })
            }
        });
        $('.OTPinput input').on('keydown', function(e){                 
            if(e.keyCode == 8) { //Backspace
                if(!$(this).val()) {
                    $(this).prev('input').focus(); //No I18n
                }
            }
        })
        $('.OTPinput input').each(function (k,v) {
            $('.OTPinput input')[k].addEventListener('paste', handleOTPPaste);  
        });
        if(timeLeft > 0) {
            $('#keyRegisterDiv > div.fab').trigger('click'); //No I18n
            $('#lockedMsg').show();
            $('#verificationDiv div.fab').addClass("disabledBlock");
            var timer = setInterval(function() {
                var emContent = $('#timeoutMsg em');                        
                timeLeft = timeLeft - 1;
                if(timeLeft <= 0) {
                    clearInterval(timer);
                    $('#verificationDiv div.fab').removeClass('disabledBlock');
                    $('#lockedMsg').hide();
                    return;
                }
                $('#timeoutMsg').html(emContent).append(timeoutMsg.replace("{0}", timeLeft));
            }, 1000);
        }
        else if(verificationStatus!==null && verificationStatus==="failed") {
            $('#keyRegisterDiv > div.fab').trigger('click'); //No I18n
            $('#incorrectOtpMsg').show();
        }

    });
}
else{
    function resendOTP() {
        if($('#otpSubmit').is(":disabled")) {
            return;
        }
        $('form[name="loginForm"] input:not([type="submit"])').attr('disabled', true); //No I18n
        $('form[name="loginForm"] input[name="resendOTP"]').not('#resendOtpEmail').removeAttr('disabled'); //No I18n
        $('form[name="loginForm"]').attr('action', 'two_factor_auth'); //No I18n
        $('form[name="loginForm"]').submit();
    }
    function logoutNewUser() {
        $('form[name="loginForm"] input:not([type="submit"]):not([name="j_username"])').attr('disabled', true); //No I18n
        $('form[name="loginForm"]').attr('action', 'two_factor_auth'); //No I18n
        $('input[name="j_username"]').val(Date.now()); //No I18n
        $('#otpSubmit').removeAttr('disabled'); //No I18n
        $('form[name="loginForm"]').submit();
    }
    function sendOTP() {
        //Display OTP Div, remove all inputs except inputs inside OTP div and change form action to AuthenticationHandler
        $('.oneTimePasswordBox').css("display", "flex"); //No I18n
        if(tfaUserEmail != "null") {
            $('#backToEmail').show();
        }
        $(".loginPopUp").addClass("WithOutAuthenticationDropDown");
        $('form[name="loginForm"]').attr('action', 'AuthenticationHandler').removeAttr('onsubmit'); //No I18n
        $('form[name="loginForm"] input').not(".oneTimePasswordBox input").not(".getEmailBox input").remove(); //No I18n
        $('form[name="loginForm"] button').not(".oneTimePasswordBox button").prop('disable', true); //No I18n
        $('form[name="loginForm"] select').remove();

        //Locked Out Message handling
        if(timeLeft>0) {
            $('#otpSubmit').attr('disabled', true); //No I18n
            var timer = setInterval(function() {
                timeLeft = timeLeft - 1;
                if(timeLeft <= 0) {
                    clearInterval(timer);
                    $('#otpSubmit').removeAttr('disabled'); //No I18n
                    $('#otpErrorMsg').hide();
                    if(tfaType==="EMAIL") {
                        $('#resendOTPBtn').show();
                    }
                    return;
                }
                $('#otpErrorMsg').show();
                $('#otpErrorMsg').html(timeoutMsg.replace("{0}", timeLeft));
                $('.oneTimePasswordBox').addClass("otpError");
            }, 1000);
        }
        //Incorrect OTP Message
        else if(verificationStatus !=null && verificationStatus==="failed") {
            $('#otpErrorMsg').text(incorrectOtpMsg);
            $('#otpErrorMsg').show();
            $('.oneTimePasswordBox').addClass("otpError");
        }
        // TFA resend OTP limit exceeded
        else if(resend_limit_exceeded==="true") {
            let timeLeft = Math.round(resend_after/1000);
            $('#otpErrorMsg').html(resendotpexceeded.replace("{0}", timeLeft));
            $('#otpErrorMsg').show();
            $('#resendOTPBtn').addClass('disabledBlock'); //No I18n
            $('.oneTimePasswordBox').addClass("otpError");
            var timer = setInterval(function() {
                timeLeft = timeLeft - 1;
                if(timeLeft <= 0) {
                    clearInterval(timer);
                    $('#otpErrorMsg').hide();
                    $('#resendOTPBtn').removeClass('disabledBlock'); //No I18n
                    return;
                }
                $('#otpErrorMsg').html(resendotpexceeded.replace("{0}", timeLeft));
            }, 1000)
        }
        //OTP not sent message handling
        else if(isOTPSent==="false") {
            $('#otpErrorMsg').text(emailOTPNotSent);
            $('#otpErrorMsg').show();
            $('.oneTimePasswordBox').addClass("otpError");
        }
        //OTP Sent Message
        else {
            if(tfaType==="TOTP_AUTHENTICATOR") {
                $('#otpSentMsg').text(otpsentmsg);
            }
            else {
                $('#otpSentMsg').text(emailotpsent + isEmailIdConfigured);
            }
        }
        //Resent OTP button if EMAIL Type TFA
        if(tfaType==="EMAIL") {
                $('#resendOTPBtn').removeAttr('disabled'); //No I18n
                $('#resendOTPBtn').show();
                $('#resendOTPBtn').click(function() {
                    resendOTP();
                });
            if(timeLeft>0) {
                $('#resendOTPBtn').hide();
            }
        }
        if(validityDays!==undefined && validityDays > 0) {
            $('#trustBrowser').closest('.keepForgot').show(); //No I18n
            $('#trustBrowser').removeAttr('disabled'); //No I18n
            $('#trustBrowser').siblings('label').text(trustdays);//No I18n
        }
    }
    function validateEmailId(paramVal)
    {
        if (paramVal != ""){
            var objRegExp  = /^[%_+a-zA-Z0-9]([a-zA-Z0-9%_\-\.\']*)@([a-zA-Z0-9_\-\.]*)(\.[a-zA-Z]+)$/i;  
            return objRegExp.test(trimAll(paramVal));    
        }else{
            return false;
        }
    }
    function configureMail() {
        document.loginForm.emailId.value = $('form[name="loginForm"] input[id="emailBox"]').val();
        var isValid = validateEmailId(document.loginForm.emailId.value);
        if(isValid) {
            $('.getEmailBox .loginErrorMessage').hide();
            $('form[name="loginForm"] input:not([type="submit"])').attr('disabled', true); //No I18n
            $('form[name="loginForm"] input[name="emailId"]').removeAttr('disabled'); //No I18n
            $('form[name="loginForm"] input[name="resendOTP"]').not('#resendOtp').removeAttr('disabled'); //No I18n
            $('form[name="loginForm"]').attr('action', 'two_factor_auth'); //No I18n
            $('form[name="loginForm"]').submit();
        } else {
            $('#emailIDErrorMsg').show();
            return false;
        }
    }
    $(document).ready(function() {
        if(tfaType==="EMAIL") {
            if(isEmailIdConfigured == "null" && !(resend_limit_exceeded==="true")) {
                $('.getEmailBox').css("display", "flex"); //No I18n
                $('#backToEmail').hide();
                $(".loginPopUp").addClass("WithOutAuthenticationDropDown");
                $('form[name="loginForm"] input').not(".getEmailBox input").remove(); //No I18n
                $('form[name="loginForm"] button').not(".getEmailBox__main button").prop('disable', true); //No I18n
                $('form[name="loginForm"] select').remove();

                if(isUniqueEmail==="false") {
                    $('#emailNotUnique').show();
                }
            } else {
                sendOTP();
            }
        } else {
            sendOTP();
        }
        if(timeLeft > 0) {
            var timer = setInterval(function() {
                var emContent = $('#timeoutMsg em');                        
                timeLeft = timeLeft - 1;
                if(timeLeft <= 0) {
                    clearInterval(timer);
                    $('#lockerrorMsg').hide();
                    $('#configureEmail').removeClass("disabledblock"); //No I18n
                    return;
                }
                $('#lockerrorMsg').show();
                $('#configureEmail').addClass("disabledblock"); //No I18n
                $('#lockerrorMsg').html(emContent).append(timeoutMsg.replace("{0}", timeLeft));
            }, 1000);
        }
        $('input[name="2factor_password"]').on('keypress', function(e) {
            if(e.keyCode === 13 || e.keyCode === 8 || e.keyCode === 9) {
                return;
            }
            var regex = new RegExp("^[0-9]+$");
            var key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
            if (!regex.test(key)) {
                e.preventDefault();
                return false;
            }
        });
        $('form[name="loginForm"]').submit(function(e) {
            if($('#otpSubmit').is(":disabled")) {
                e.preventDefault();
                return;
            }
            if(!$('#emailIDErrorMsg').is(":hidden") || !$('#lockerrorMsg').is(":hidden")) {
                e.preventDefault();
                return;
            }
            if($("input[name='2factor_password']").val() === '' && !$("input[name='2factor_password']").prop('disabled')) {
                $('#otpErrorMsg').show();
                $('#otpErrorMsg').text(enterotpmsp);
                return;
            }
            if($('input[name="j_username"]').val() == "null") {
                $('input[name="j_username"]').remove();
            }
            if($('input[name="j_username"]').val() == '') {
                $('input[name="j_username"]').val(tfausername);
            }
        });
    });
}
