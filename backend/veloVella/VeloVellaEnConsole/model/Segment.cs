using System.Collections.Generic;

namespace VeloVellaEnConsole.model
{
    public class Segment
    {
        public double Distance { get; set; }
        public double Duration { get; set; }
        public List<Step> Steps { get; set; }
    }
}