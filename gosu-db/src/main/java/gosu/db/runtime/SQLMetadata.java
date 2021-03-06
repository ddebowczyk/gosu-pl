package gosu.db.runtime;

import gw.lang.reflect.IPropertyInfo;
import gw.lang.reflect.IType;
import gosu.db.plugin.ISQLTableType;
import gosu.db.plugin.SQLColumnPropertyInfo;

/**
 * Created by klu on 7/1/2015.
 */
public class SQLMetadata  implements ITypeToSQLMetadata{

  public SQLMetadata() {
  }

  public String getTableForType(IType type){
    return ((ISQLTableType) type).getTable().getTableName();
  }

  public String getColumnForProperty(IPropertyInfo pi){
    SQLColumnPropertyInfo asSQL = (SQLColumnPropertyInfo) pi;
    return asSQL.getColumnName();

  }
}
