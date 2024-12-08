using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VeloVellaEnConsole.model
{
    public class FeatureCollection
    {
        public string Type { get; set; }
        public double[] Bbox { get; set; }
        public List<Feature> Features { get; set; }
    }
}
