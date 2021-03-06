package gosu.mail

uses java.lang.System
uses java.lang.IllegalStateException
uses java.lang.Thread

/**
 * Created by IntelliJ IDEA.
 * User: rkitts
 * Date: 2/8/12
 * Time: 1:10 PM
 *
 * A bunch of disjoint and generally unrelated tests for GosuMail.
 */
class GosuMailTest extends GosuMailTestCase{

  public function testAskingForNonExistentFolderReturnsNull()
  {
    var account = new GMailIMAPAccount(TestAccountConfig.GMAIL_USERNAME, TestAccountConfig.GMAIL_PASSWORD);
    var nonExistent = account.getFolder("crapola")
    assertNull(nonExistent)
  }

  public function testUnreadMessageCountEqualsUnreadEmailMessagesSize()
  {
    var account = new GMailIMAPAccount(TestAccountConfig.GMAIL_USERNAME, TestAccountConfig.GMAIL_PASSWORD)
    clearFolder(account.Inbox)
    var email = new EmailMessage () {
        :From = TestAccountConfig.GMAIL_USERNAME,
        :To = TestAccountConfig.GMAIL_USERNAME,
        :Subject = "Testing",
        :Text = "From gosumail in the debugger. Sweet!"
    }
    addUnreadMessages(account, email, 4)
    account.close()

    account = new GMailIMAPAccount(TestAccountConfig.GMAIL_USERNAME, TestAccountConfig.GMAIL_PASSWORD)
    var timeToWait = 60000 * 3
    while(account.Inbox.UnreadMessageCount == 0 && timeToWait > 0){
      Thread.sleep(5000)
      timeToWait -= 5000
    }
    // Ordering here is important. GMail marks messages as read (SEEN) as soon as they are downloaded.
    var unreadCount = account.Inbox.UnreadMessageCount
    assertTrue(account.Inbox.UnreadMessageCount > 0)
    var unreadMessages = account.Inbox.UnreadEmailMessages
    assertEquals(unreadCount, unreadMessages.size())
  }

  public function testMarkingMessageReadReducesUnreadMessageCount()
  {
    var account = new GMailIMAPAccount(TestAccountConfig.GMAIL_USERNAME, TestAccountConfig.GMAIL_PASSWORD)
    clearFolder(account.Inbox)
    var email = new EmailMessage () {
        :From = TestAccountConfig.GMAIL_USERNAME,
        :To = TestAccountConfig.GMAIL_USERNAME,
        :Subject = "Testing",
        :Text = "From gosumail in the debugger. Sweet!"
    }
    addUnreadMessages(account, email, 4)
    account.close()

    account = new GMailIMAPAccount(TestAccountConfig.GMAIL_USERNAME, TestAccountConfig.GMAIL_PASSWORD)
    var unrCount = account.Inbox.UnreadMessageCount
    var unreadMessages = account.Inbox.UnreadEmailMessages
    unreadMessages[0].markRead()
    assertTrue(unreadMessages[0].isMarkedRead())
    assertEquals(unrCount - 1, account.Inbox.UnreadMessageCount)
  }

  public function testSendingMailSeemsToWork()
  {
    // Send mail to ourselves, wait a little bit, see if it shows up
    var account = new GMailIMAPAccount(TestAccountConfig.GMAIL_USERNAME, TestAccountConfig.GMAIL_PASSWORD)
    var start = account.Inbox.UnreadMessageCount
    var email = new EmailMessage () {
        :From = TestAccountConfig.GMAIL_USERNAME,
        :To = TestAccountConfig.GMAIL_USERNAME,
        :Subject = "Testing",
        :Text = "From gosumail in the debugger. Sweet!"
    }
    account.send(email)
    var now = System.currentTimeMillis()
    while(System.currentTimeMillis() < now + 60000 * 3){
      if(account.Inbox.UnreadMessageCount != start){
        break
      }
      Thread.sleep(5000)
    }
    assertEquals(start + 1, account.Inbox.UnreadMessageCount)
  }
}