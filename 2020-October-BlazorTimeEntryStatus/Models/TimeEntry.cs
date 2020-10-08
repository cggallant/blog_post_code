using System;
using System.Collections.Generic;
using System.Globalization;

namespace BlazorTimeEntryStatus.Models
{
    public class TimeEntryResponse
    {
        public List<TimeEntry> TimeEntries { get; set; }

        public string PrevPageURI { get; set; }
        public string NextPageURI { get; set; }
    }


    // Only grabbing the information that's needed for this app (rest of the fields can be found here: https://www.dovico.com/developer/API_doc/index.htm#t=API_Calls_v7%2FTime_Entries_v7.htm)
    public class TimeEntry
    {
        public string ID { get; set; } 
        public Sheet Sheet { get; set; }

        protected string _DateString = "";
        public string Date
        {
            get { return _DateString; }
            set { SetDate(value); }
        }


        // Needed so that you can sort and compare based on the date value
        protected DateTime _Date = DateTime.MinValue;
        public DateTime TheDate { get { return _Date; } }

        protected void SetDate(string Date)
        {
            // Remember the original string
            _DateString = Date;

            _Date = DateTime.ParseExact(Date, "yyyy-MM-dd", CultureInfo.InvariantCulture);
        }
    }

    public class Sheet
    {
        public string ID { get; set; }
        public string Status { get; set; }
    }
}
