using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ghost_nullptr
{
    public abstract class TaskQueue_Base:IDisposable
    {
        public int TotalCores { get; protected set; }
        protected List<CallExtFunc> _Queue;
        public EventHandler Exit { get; set; }
        public TaskQueue_Base(int TotalCores)
        {
            this.TotalCores = TotalCores;
            _Queue = new List<CallExtFunc>();
        }

        public abstract void Start();

        public abstract bool CanPeek { get; }

        public abstract CallExtFunc GetLast();

        #region IDisposable Support
        private bool disposedValue = false; // 要检测冗余调用

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    // TODO: 释放托管状态(托管对象)。
                    foreach (var i in _Queue)
                        i.Dispose();
                    _Queue.Clear();
                }

                // TODO: 释放未托管的资源(未托管的对象)并在以下内容中替代终结器。
                // TODO: 将大型字段设置为 null。

                disposedValue = true;
            }
        }

        // TODO: 仅当以上 Dispose(bool disposing) 拥有用于释放未托管资源的代码时才替代终结器。
        // ~TaskQueue_Base() {
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
    public class TaskQueue:TaskQueue_Base
    {
        public TaskQueue(int TotalCores) : base(TotalCores)
        {

        }

        public void AddTask(CallExtFunc func)
        {
            _Queue.Add(func);
        }

        public override void Start()
        {
            _Queue[0].Start(Process_Done);
        }

        public override bool CanPeek
        {
            get
            {
                return _Queue.Count > 1;
            }
        }

        public override CallExtFunc GetLast()
        {
            CallExtFunc func = _Queue[_Queue.Count - 1];
            _Queue.RemoveAt(_Queue.Count - 1);
            return func;
        }

        void Process_Done(object sender, EventArgs e)
        {
            //TODO:补上数据库操作
			Console.WriteLine ("Process Exited");
            SqlHelper.UpdateWorkState((sender as CallExtFunc).ID, 3);
            _Queue[0].Dispose();
            _Queue.RemoveAt(0);
            Exit(this, new EventArgs());
            Dispose();
        }
    }
    public class TempQueue:TaskQueue_Base
    {
        public TempQueue(int TotalCores, CallExtFunc func) : base(TotalCores)
        {
            _Queue.Add(func);
        }
        public override void Start()
        {
            _Queue[0].Start(Exit);
        }
        public override bool CanPeek
        {
            get
            {
                return false;
            }
        }
        public override CallExtFunc GetLast()
        {
            return _Queue[0];
        }
    }
}
