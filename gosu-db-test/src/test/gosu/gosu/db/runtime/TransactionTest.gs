package gosu.db.runtime

uses org.junit.Assert
uses org.junit.Before
uses org.junit.BeforeClass
uses org.junit.Test
uses gosu.db.Main
uses gosu.db.GosuDB

uses java.io.BufferedReader
uses java.io.FileReader
uses java.lang.Math

/**
 * Created by pjennings on 7/27/2015.
 */
class TransactionTest {

  @BeforeClass
  static function beforeClass() {
    GosuDB.setDBUrl("jdbc:h2:mem:sqlconstrainttest;DB_CLOSE_DELAY=-1");
    GosuDB.execStatement(Main.SqlSource)




  }

  @Before
  function clearMain() {
    Main.Tables.each(\t -> t.deleteAll(true))
  }


  @Test
  function basicTransaction() {

    GosuDB.establishConnection()
    var names = loadNames()
    for (name in names) {
      var y = name.split("[ \t]")
      var x = new Main.Contact()
      x.FirstName = y[0]
      x.LastName = y[1]
      x.Age = Math.ceil(Math.random() * 100) as int
      x.create()

    }
    try {
      Main.transaction(\->
          {
            var z = new Main.Contact()
            z.create()


            //Main.Tables.each(\t -> t.deleteAll(true))
            var x = Main.Contact.select().where(Main.Contact#FirstName.isGreaterThan(5)).on(Main.Contact#FirstName.isLike("%ddd%")).Count
            print("Made it here???")
            //This should cause an SQL error, canceling the entire transaction
          }
      )
    }
    catch (e){
      print("Query failed as expected, transaction should roll back")
    }



    Assert.assertEquals(1001, Main.Contact.select().Count)

    Main.transaction( \ -> {Main.Tables.each(\t -> t.deleteAll(true))} )

    Assert.assertEquals(0, Main.Contact.select().Count)


    GosuDB.releaseConnection()

  }


  function loadNames():List<String>{
    var br = new BufferedReader(new FileReader("src/test/resources/names.txt"))
    var x = br.readLine()
    var strings = {"Sammy Chan"}
    while(x != null){
      strings.add(x)
      x = br.readLine()
    }
    return strings
  }
}
