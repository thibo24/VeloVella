using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace veloVella
{
    internal class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Bienvenue dans l'application veloVella!");


            Server server = new Server("http://localhost:8080/");
            server.StartAsync(); 
            Console.WriteLine("Appuyez sur une touche pour arrêter le serveur...");
            Console.ReadKey();
            server.Stop();
            Console.WriteLine(" stopped.");

        }
    }
}
