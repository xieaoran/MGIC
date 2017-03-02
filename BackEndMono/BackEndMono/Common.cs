
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ghost_nullptr
{
    public static class Common
    {
		private static string inputPath = "/var/www/html/storage/{0}/input/";
        public static string GetInputPath(int ID)
        {
            return string.Format(inputPath, ID.ToString());
        }
		private static string outputPath= "/var/www/html/storage/{0}/output/";
        public static string GetOutputPath(int ID)
        {
            return string.Format(outputPath, ID.ToString());
        }
    }
}
