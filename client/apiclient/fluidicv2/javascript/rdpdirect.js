function rdpConn(){
    if(showRemoteDesktop==="false") {
    alert('RDP is not Enabled!!');  //No I18N
        window.close();
        return;
    }
    if(isRDPChanged) {
    alert('Please restart Opmanager to Enable RDP!!');  //No I18N
        window.close();
        return;
    }
  if(invalidOpmObj) {
    alert('Device not found in OpManager!!'); //No I18N
        window.close();
        return;
  }
  if(!(hasRDPAccess)) {
    alert('User is not Authorized to view this Device in OpManager!!'); //No I18N
        window.close();
        return;
  } 
  if(!window.OPM.userPermissions.monitoringWrite)
{
alert(Ember.I18n.t('webclient.common.restrictionMsg',this)); //No I18N
        window.close();
          return;
} 
    var protocol = wsProtocol;
    r = svManager.getInstance(); 
    if(!invalidOpmObj){
    r = new svGlobal.Rdp( protocol +location.host.split(":")[0]+":"+rdpPort+"/RDP?" +globalParam);// No I18N
    }
    r.addSurface(new svGlobal.LocalInterface());
    r.reconnectOnResize = true;
    r.onerror = function(e){
if(e!== undefined && e.message === "")
{
  e.message = Ember.I18n.t('webclient.rdp.emptyresult.message',this); //No I18N
  }
        alert(e.message);
        window.close();

    }
    r.onrequestcredential = function(serverInfo){
          
            // When Network Level Authentication is enabled and username/password/domainname combination is incorrect,
            // then in order to avoid the grey screen which is misleading, we can handle that case inside this function 
        
        //redirect the page to any url.
        return true;//stop the default behaviour
    }
    r.run();
    
}
window.addEventListener("load", function(event) {
    rdpConn();
});