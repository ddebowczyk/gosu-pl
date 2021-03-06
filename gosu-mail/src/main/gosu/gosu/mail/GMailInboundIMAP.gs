package gosu.mail

uses java.util.Properties
uses javax.mail.Authenticator
uses javax.mail.PasswordAuthentication
uses javax.mail.Session
uses javax.mail.Store
uses javax.mail.Folder

/**
 * Created by IntelliJ IDEA.
 * User: rkitts
 * Date: 1/27/12
 * Time: 2:49 PM
 * To change this template use File | Settings | File Templates.
 */
class GMailInboundIMAP extends InboundIMAP{

  construct(uName : String, pword : String)
  {
    super("imap.gmail.com", uName, pword)
    return
  }

  override protected property get EmailStore() : Store
  {
    if(_store == null){
      _store = MailSession.getStore("imaps")
      _store.connect()
    }
    return(_store)
  }

  override function buildSession(): Session {
    var sessionProps = new Properties()
    sessionProps.put("mail.store.protocol", "imaps")
    sessionProps.put("mail.imaps.user", UserName)
    sessionProps.put("mail.imaps.host", Server)

    var retVal = Session.getInstance(sessionProps, new Authenticator(){
      property get PasswordAuthentication(): PasswordAuthentication {
        return new PasswordAuthentication(UserName, Password)
      }
    });
    return(retVal)
  }
}