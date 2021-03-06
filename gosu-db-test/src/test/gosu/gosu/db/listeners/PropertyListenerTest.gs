package gosu.db.listeners

uses gw.lang.reflect.features.BoundPropertyReference
uses gw.lang.reflect.features.PropertyReference
uses org.junit.Assert
uses org.junit.Before
uses org.junit.BeforeClass
uses org.junit.Test
uses gosu.db.Main
uses gosu.db.Main.*
uses gosu.db.GosuDB
uses gosu.db.plugin.SQLColumnPropertyInfo
uses gosu.db.runtime.IHasListenableProperties

class PropertyListenerTest {

  @BeforeClass
  static function beforeClass(){
    GosuDB.setDBUrl("jdbc:h2:mem:PropertyListenerTest;DB_CLOSE_DELAY=-1");
    GosuDB.execStatement(Main.SqlSource)
  }

  @Before
  function clearContacts() {
      Main.Tables.each(\t -> t.deleteAll(true))
  }



  @Test
  function createPropertyListener() {
    var propRef = Contact#FirstName

    Assert.assertTrue(propRef typeis PropertyReference)
    Assert.assertTrue(propRef.getPropertyInfo() typeis SQLColumnPropertyInfo)
    Assert.assertFalse(propRef typeis IHasListenableProperties)
    Assert.assertTrue(propRef.getPropertyInfo() typeis IHasListenableProperties)
    print("DoContact#FirstName's PropertyInfo owner is: " + propRef.getPropertyInfo().getOwnersType().getName())

    var context = new Contact() {
        :FirstName = "Foo"
    }

    Assert.assertEquals("Foo", propRef.get(context))

    propRef.addListener(\contact -> {
      print("Updating FirstName")
      contact.LastName = "BAZ"
      return contact.FirstName.toUpperCase()
    })

    context.FirstName = "Bar"

    Assert.assertEquals("BAR", context.FirstName)
    Assert.assertEquals("BAZ", context.LastName)

    propRef.clearListeners()
  }

  @Test
  function createInstanceListener() {
    var c = new Contact()
    c.FirstName = "Brian"
    c.Id = 42
    c.create()

    var boundPropRef = c#FirstName
    boundPropRef.get()

    print("Preparing to add instance listener")
    Assert.assertTrue(boundPropRef typeis BoundPropertyReference)
    Assert.assertTrue(boundPropRef.getPropertyInfo() typeis SQLColumnPropertyInfo)
    Assert.assertFalse(boundPropRef typeis IHasListenableProperties)
    Assert.assertTrue(boundPropRef.getPropertyInfo() typeis IHasListenableProperties)
    print("c#FirstName's PropertyInfo owner is: " + boundPropRef.getPropertyInfo().getOwnersType().getName())
    Assert.assertEquals("Brian", boundPropRef.get())

    boundPropRef.addListener(\contact -> {
      print("Updating FirstName")
      contact.LastName = "Moore"
      return contact.FirstName
    })

    print("Done adding listener.")

    boundPropRef.set("Kyle")

    print("Done firing listener.")

    Assert.assertEquals("Kyle", c.FirstName)
    Assert.assertEquals("Moore", c.LastName)

    boundPropRef.clearListeners()
  }

  @Test
  function instanceAndPropertyListeners() {

    var c = new Contact()
    c.FirstName = "Brian"
    c.Id = 42
    c.create()

    Assert.assertEquals("Brian", c.FirstName)
    Assert.assertNull(c.LastName)

    //add bound listener
    c#FirstName.addListener( \ contact -> {
      print("appending 'bar' to ${contact.FirstName}")
      return contact.FirstName + "bar"
    })

    //add property listener
    Contact#FirstName.addListener( \ contact -> {
      print("upcasing ${contact.FirstName}")
      return contact.FirstName.toUpperCase()
    })

    c.FirstName = "Foo"

    Assert.assertEquals("FOObar", c.FirstName)

    c#FirstName.clearListeners()
    Contact#FirstName.clearListeners()

    c.FirstName = "foo"

    Assert.assertEquals("foo", c.FirstName)
  }

  @Test
  function scopeMatters() {
    var foo = new Contact()
    foo.FirstName = ""
    foo.Id = 42
    foo.create()

    //add bound listener
    foo#FirstName.addListener( \ contact -> {
      print("appending 'xxx' to ${contact.FirstName}")
      return contact.FirstName + "xxx"
    })

    var bar = new Contact()
    bar.FirstName = ""
    bar.Id = 99
    bar.create()

    //add unbound listener
    Contact#FirstName.addListener( \ contact -> {
      print("upcasing ${contact.FirstName}")
      return contact.FirstName.toUpperCase()
    })

    foo.FirstName = "foo"
    bar.FirstName = "bar"

    Assert.assertEquals("FOOxxx", foo.FirstName)
    Assert.assertEquals("BAR", bar.FirstName)

    Contact#FirstName.clearListeners()
  }

}