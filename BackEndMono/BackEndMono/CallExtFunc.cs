using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Threading.Tasks;
using System.Diagnostics;

namespace Ghost_nullptr
{
    public class CallExtFunc:IDisposable
    {
        //TODO:command表示系统bash中的command
        protected virtual string Appname { get { return "mpiexec"; } }
        protected virtual string ArgumentFormat { get { return "-n {0} pw.x <{1}> {2}"; } }
        Process process;

        public int ID { get; protected set; }

        string inputPath;
        string outputPath;
        string inputName;
        string outputName;

        public int CoreNumbers { get; set; }
        public string Out { get; set; }
        protected CallExtFunc()
        {
            CoreNumbers = 1;
        }
        public CallExtFunc(int ID, string name, int coreNumbers)
        {
            this.ID = ID;
            CoreNumbers = coreNumbers;
            inputPath = Common.GetInputPath(ID);
            outputPath = Common.GetOutputPath(ID);
            inputName = name;
            outputName = System.Text.RegularExpressions.Regex.Replace(name, ".in", ".out");
        }

        public void Start(EventHandler Exited)
        {
			string Argument = string.Format(ArgumentFormat, CoreNumbers.ToString(), inputPath + inputName, outputPath + outputName);
			var scriptPath = inputPath + "run.sh";
			var script = new StreamWriter (scriptPath, false, Encoding.ASCII);
			script.WriteLine (Appname + " " + Argument);
			script.Close ();
            //TODO:整合Arguments
			process = new Process ();
			process.StartInfo = new ProcessStartInfo ("bash", scriptPath);
			Console.WriteLine (Appname + " " + Argument);
			//process.Exited += Exited;
			process.Start ();
			process.WaitForExit ();
			Exited (this, new EventArgs ());
        }


        public void Kill()
        {
            process.Kill();
            process = null;
        }

        #region IDisposable Support
    private bool disposedValue = false; // 要检测冗余调用

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    // TODO: 释放托管状态(托管对象)。
                    process.Close();
                }

                // TODO: 释放未托管的资源(未托管的对象)并在以下内容中替代终结器。
                // TODO: 将大型字段设置为 null。

                disposedValue = true;
            }
        }

        // TODO: 仅当以上 Dispose(bool disposing) 拥有用于释放未托管资源的代码时才替代终结器。
        // ~CallExtFunc() {
        //   // 请勿更改此代码。将清理代码放入以上 Dispose(bool disposing) 中。
        //   Dispose(false);
        // }

        // 添加此代码以正确实现可处置模式。
        public void Dispose()
        {
            // 请勿更改此代码。将清理代码放入以上 Dispose(bool disposing) 中。
            Dispose(true);
            // TODO: 如果在以上内容中替代了终结器，则取消注释以下行。
            // GC.SuppressFinalize(this);
        }
        #endregion
    }
}
