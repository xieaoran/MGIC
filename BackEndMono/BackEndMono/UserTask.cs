using System;
using System.Threading;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ghost_nullptr
{
    class UserTask
    {
        int ID;
        public int MaxCores
        {
            get; protected set;
        }//核数上限

        string Path;
        List<TaskThread> TaskList;

        TaskThread tasks;
        List<TaskThread> AdditionalTasks;

        public EventHandler Exit { get; set; }

        public UserTask(int MaxCores, int ID)
        {
            this.ID = ID;
            this.MaxCores = MaxCores;
            TaskList = new List<TaskThread>();

            tasks = new TaskThread();
            tasks.queue = new TaskQueue(MaxCores);
            tasks.queue.Exit = MainQueue_Done;
            tasks.thread = new Thread(tasks.queue.Start);

            System.IO.DirectoryInfo dirInfo = new System.IO.DirectoryInfo(Common.GetInputPath(ID));
            var info = dirInfo.GetFiles("*.in", System.IO.SearchOption.TopDirectoryOnly);

            CallExtFunc func = new CallExtFunc(ID, info[0].Name, MaxCores);
            (tasks.queue as TaskQueue).AddTask(func);
        }

        private void MainQueue_Done(object sender, EventArgs e)
        {
            tasks.thread.Abort();
            tasks = null;
            //给附加任务转正
            if (AdditionalTasks.Count > 0)
            {
                tasks = AdditionalTasks[0];
                tasks.queue.Exit = MainQueue_Done;
                AdditionalTasks.RemoveAt(0);
            }
            else
            {
                Exit(this, new EventArgs());
            }
        }

        public void Start()
        {
			tasks.thread.Start ();
        }


        /// <summary>
        /// 每个TaskQueue的回调函数
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        protected void Queue_Done(object sender, EventArgs e)
        {
            TaskQueue_Base queue = sender as TaskQueue_Base;
            TaskThread t = TaskList.Find(a => a.queue == queue);
            t.thread.Abort();
			t.thread = null;
            TaskList.Remove(t);
            if (TaskList.Count == 0)
                Exit(this, new EventArgs());
        }
    }
    public class TaskThread
    {
        public TaskQueue_Base queue;
        public Thread thread;
    }
}
