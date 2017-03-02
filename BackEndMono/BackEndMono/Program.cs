using System;
using System.Threading;

namespace Ghost_nullptr
{
	class MainClass
	{
		public static void Main (string[] args)
		{
			var server = new CalcServer ();
			while (true) {
				Thread.Sleep (10000);
			}
		}
	}
}
