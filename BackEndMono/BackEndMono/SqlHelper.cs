using System;
using System.Collections.Generic;
using System.Data.Linq;
using System.Text;
using System.Threading.Tasks;
using Mono.Data.Sqlite;

namespace Ghost_nullptr
{
    public static class SqlHelper
    {
        public static SqliteConnection sqlConnection;

        public static void Connect()
        {
            sqlConnection = new SqliteConnection(
                "DbLinqProvider=Sqlite;" +
                "Data Source=/var/www/html/db.sqlite3");
			sqlConnection.Open ();
        }

        private static string GetIDTemplate = "select id from main_work where WorkState = {0}";
        private static string SetWorkStateTemplate = "update main_work set WorkState = {0} where id = {1}";
        public static int? GetFirstIdleTask()
        {
            SqliteCommand sqlCommand = sqlConnection.CreateCommand();
            sqlCommand.CommandText = string.Format(GetIDTemplate, 1.ToString());
            var result = sqlCommand.ExecuteReader();
			if (!result.Read ()) {
				sqlCommand.Dispose();
				result.Close();
				return null;
			}
            try
            {
                int ID = result.GetInt32(0);
                if (UpdateWorkState(ID, 2) > 0)
                {
					sqlCommand.Dispose();
					result.Close();
                    return ID;
                }
				sqlCommand.Dispose();
				result.Close();
                return -1;
            }
            catch (Exception e)
            {
				Console.WriteLine (e.Message);
				sqlCommand.Dispose();
				result.Close();
                return null;
            } 
        }

        public static int UpdateWorkState(int ID, int NewState)
        {
            SqliteCommand sqlCommand = sqlConnection.CreateCommand();
            sqlCommand.CommandText = string.Format(SetWorkStateTemplate, NewState.ToString(), ID.ToString());
            var result = sqlCommand.ExecuteNonQuery();
			sqlCommand.Dispose ();
			return result;
        }
    }
}
