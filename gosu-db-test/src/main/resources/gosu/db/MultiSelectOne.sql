SELECT Customers.CustomerID, Orders.OrderDate, Customers.Address FROM Customers INNER JOIN Orders ON Customers.CustomerID = Orders.CustomerID;