
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const NumeriUtili = () => {
  const isMobile = useIsMobile();

  const handleCall = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    console.log("Tentativo di chiamata:", cleanNumber);
    
    // Crea il link tel: direttamente
    const telLink = `tel:${cleanNumber}`;
    console.log("Link tel generato:", telLink);
    
    // Usa window.location.href per massima compatibilità
    window.location.href = telLink;
  };

  const handleWhatsApp = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    const whatsappUrl = `https://wa.me/39${cleanNumber}`;
    console.log("Link WhatsApp generato:", whatsappUrl);
    window.open(whatsappUrl, '_blank');
  };

  const contacts = [
    {
      category: "Responsabile da contattare sempre",
      contacts: [
        { name: "De Meo Vito", number: "3381297170" }
      ]
    },
    {
      category: "Idraulico",
      contacts: [
        { name: "Piero Albanese", number: "3381755561" },
        { name: "Giacomo Morè", number: "3484634547" }
      ]
    },
    {
      category: "Elettricista",
      contacts: [
        { name: "Onofrio Centomani", number: "3209128684" }
      ]
    },
    {
      category: "Tuttofare",
      contacts: [
        { name: "Enzo Giannoccaro", number: "3384023937" }
      ]
    },
    {
      category: "Fabbro",
      contacts: [
        { name: "Angelo Pietromonaco", number: "3384922501" }
      ]
    },
    {
      category: "Riparazioni Lavatrici",
      contacts: [
        { name: "Di Meo Lavatrici", number: "080742515" }
      ]
    }
  ];

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
      <div className="flex items-center justify-between">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>
          Numeri Utili
        </h1>
      </div>

      <div className="grid gap-4">
        {contacts.map((section, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-700">
                {section.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.contacts.map((contact, contactIndex) => (
                <div 
                  key={contactIndex}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.number}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button
                      onClick={() => handleCall(contact.number)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Chiama
                    </Button>
                    <Button
                      onClick={() => handleWhatsApp(contact.number)}
                      size="icon"
                      variant="outline"
                      className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 h-9 w-9"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NumeriUtili;
