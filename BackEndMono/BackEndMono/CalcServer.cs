using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ghost_nullptr
{
    class CalcServer
    {
        public int MaxCores { get; set; }
        public int CurrentCores { get; set; }
        public int WaitingCores { get; set; }
        int AvailableCores { get { return MaxCores - CurrentCores; } }

        UserTask PrimaryUser { get { return Users[0] ?? null; } }


        System.Timers.Timer timer = new System.Timers.Timer();

        public CalcServer()
        {
			this.MaxCores = 4;
            SqlHelper.Connect();
            timer.Interval = 10000;
            timer.Elapsed += Timer_Elapsed;
            timer.Start();
        }

        private void Timer_Elapsed(object sender, System.Timers.ElapsedEventArgs e)
        {
            while (CurrentCores + WaitingCores <= MaxCores)
            {
                //轮询数据库，找到全部新任务
                int? ID = SqlHelper.GetFirstIdleTask();
                if (ID != null)
                {
                    GotRequest((int)ID, MaxCores);
                }
				timer.Stop ();
            }
        }

        List<UserTask> Users = new List<UserTask>();

        public void GotRequest(int ID, int requestCores)
        {
            UserTask ut = new UserTask(requestCores, ID);
            ut.Exit += UserExit;
            ut.Start();
            Users.Add(ut);
            CurrentCores += requestCores;
        }

        public void UserExit(object sender,EventArgs e)
        {
            UserTask t = sender as UserTask;
            Users.Remove(t);
			t = null;
            timer.Start();
        }
    }
}
