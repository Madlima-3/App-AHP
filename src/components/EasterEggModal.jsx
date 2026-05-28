import { useEffect, useState } from 'react';
import { X, Heart } from 'lucide-react';

const mensagens = [
  "Minha chimbrinha, cada meta que conquistamos juntos, cada sonho que planejamos, cada esforço — tudo só faz sentido porque você está ao meu lado.",
  "Nossa família é a nossa melhor conquista! Obrigado por nos permitir viver tudo o que vivemos. Te amo.",
  "A melhor decisão que já tomei não está em nenhuma meta aqui — foi escolher você todos os dias.",
];

export default function EasterEggModal({ onClose }) {
  const [visible, setVisible] = useState(false);
  const [mensagem] = useState(() => mensagens[Math.floor(Math.random() * mensagens.length)]);
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    const generated = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: Math.random() * 90 + 5,
      delay: Math.random() * 1.5,
      size: Math.random() * 14 + 10,
      duration: Math.random() * 2 + 2,
    }));
    setHearts(generated);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${visible ? 'bg-black/50' : 'bg-transparent'}`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden transition-all duration-300 ${visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Corações flutuantes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {hearts.map(h => (
            <Heart
              key={h.id}
              size={h.size}
              className="absolute bottom-0 text-vpink fill-vpink animate-float"
              style={{
                left: `${h.left}%`,
                animationDelay: `${h.delay}s`,
                animationDuration: `${h.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-vcoral to-vpink px-6 pt-8 pb-6 text-center relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 p-3 rounded-full">
              <Heart size={32} className="fill-white text-white" />
            </div>
          </div>
          <h2 className="text-white text-lg font-bold">Para você, meu amor</h2>
        </div>

        {/* Mensagem */}
        <div className="px-6 py-6 text-center">
          <p className="text-slate-600 text-sm leading-relaxed italic">
            "{mensagem}"
          </p>
          <p className="mt-4 text-vcoral font-semibold text-sm">— Com todo o meu amor ♥</p>
        </div>

        {/* Rodapé */}
        <div className="px-6 pb-6 text-center">
          <button
            onClick={handleClose}
            className="bg-gradient-to-r from-vcoral to-vpink text-white text-sm font-medium px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity shadow"
          >
            Amo você também ♥
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%   { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
