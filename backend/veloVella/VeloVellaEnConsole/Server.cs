using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace veloVella
{
    public class Server
    {
        private readonly HttpListener _listener;
        private readonly string[] _prefixes;
        private APIJCdecoProxy _apiJCdecoProxy;

        public Server(params string[] prefixes)
        {
            if (prefixes == null || prefixes.Length == 0)
                throw new ArgumentException("Prefixes cannot be null or empty", nameof(prefixes));

            _prefixes = prefixes;
            _listener = new HttpListener();
            foreach (string prefix in _prefixes)
            {
                _listener.Prefixes.Add(prefix);
            }
        }

        public async Task StartAsync()
        {
            _listener.Start();
            Console.WriteLine("Server started...");
            _apiJCdecoProxy = new APIJCdecoProxy();

            while (_listener.IsListening)
            {
                HttpListenerContext context = await _listener.GetContextAsync();
                _ = Task.Run(() => HandleRequestAsync(context));
            }

        }

        public void Stop()
        {
            _listener.Stop();
            _listener.Close();
            Console.WriteLine("Server stopped.");
        }

        private async Task HandleRequestAsync(HttpListenerContext context)
        {
            HttpListenerRequest request = context.Request;
            HttpListenerResponse response = context.Response;

            switch (request.Url.AbsolutePath)
            {
                case "/":
                    String ping = "reçu";
                    byte[] dd = Encoding.UTF8.GetBytes(ping);
                    response.ContentLength64 = dd.Length;
                    response.OutputStream.Write(dd, 0, dd.Length);
                    response.OutputStream.Close();
                    break;
                case "/calculateRoutes":
                    System.Console.WriteLine("Calcul de l'itinéraire");
                    calculateRoutes(request, response);
                    break;
                default:
                    System.Console.WriteLine("Choquebar");
                    response.StatusCode = (int)HttpStatusCode.NotFound;
                    byte[] buffer = Encoding.UTF8.GetBytes("Route non trouvée");
                    response.ContentLength64 = buffer.Length;
                    await response.OutputStream.WriteAsync(buffer, 0, buffer.Length);
                    response.OutputStream.Close();
                    break;
            }
        }

        private void calculateRoutes(HttpListenerRequest request, HttpListenerResponse response)
        {
            if (request.HttpMethod == "POST")
            {
                // Lire le corps de la requête
                string body = new System.IO.StreamReader(request.InputStream).ReadToEnd();

                System.Console.WriteLine("body " + body);
                // Désérialisation
                var coordinates = JsonConvert.DeserializeObject<List<CityCoordinate>>(body);
                System.Console.WriteLine("coordinate " + coordinates[0]);


                if (coordinates != null && coordinates.Count >= 2)
                {
                    CityCoordinate pointCoordinateStart = coordinates[0];
                    CityCoordinate pointCoordinateEnd = coordinates[1];
                    string path = _apiJCdecoProxy.getPathBetwenToPoint(pointCoordinateStart, pointCoordinateEnd).Result;
                    byte[] buffer = Encoding.UTF8.GetBytes(path);
                    response.ContentLength64 = buffer.Length;
                    response.OutputStream.Write(buffer, 0, buffer.Length);
                    response.OutputStream.Close();
                }
                else
                {
                    response.StatusCode = (int)HttpStatusCode.MethodNotAllowed;
                    byte[] buffer = Encoding.UTF8.GetBytes("wrong body ");
                    response.ContentLength64 = buffer.Length;
                    response.OutputStream.Write(buffer, 0, buffer.Length);
                    response.OutputStream.Close();
                }
            }
            else
            {
                response.StatusCode = (int)HttpStatusCode.MethodNotAllowed;
                byte[] buffer = Encoding.UTF8.GetBytes("Méthode non autorisée");
                response.ContentLength64 = buffer.Length;
                response.OutputStream.Write(buffer, 0, buffer.Length);
                response.OutputStream.Close();
            }
        }
    }
}
