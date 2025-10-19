using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PfeProject.Application.Models.Stocks
{
    public class AssignUsToLocationRequest
    {
        public string UsCode { get; set; }        // Code de l'US à affecter
        public string LocationCode { get; set; }  // Emplacement cible
        public string AssignedBy { get; set; }    // Email ou matricule
    }
}