"use client";
import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Eres el diseñador oficial de Matilde Brunch, un restaurante brunch en Medellín con inspiración latino-europea (principalmente francesa e italiana). Tu trabajo es generar piezas de diseño en HTML/CSS para posts de Instagram (1080x1080px) y stories (1080x1920px).

=== IDENTIDAD DE MARCA MATILDE BRUNCH ===

ESLOGAN: "La magia está por dentro"

PALETA DE COLORES:
- Rosado confite: #E8A0B4 (color principal, fondos y diagramación)
- Verde malteado: #A8C5A0 (color principal, fondos)
- Vainilla: #F5EDD0 (color principal, fondos)
- Naranja intenso: #E8622A (acento vibrante)
- Ocre: #B8860B (acento cálido)
- Esmeralda oscuro: #1C4A3E (acento profundo)
- Negro: #1A1A1A (logo y textos)
- Dorado: #B8860B (logo, detalles premium)
- Blanco: #FFFFFF

TIPOGRAFÍAS (usar Google Fonts equivalentes):
- Principal/Display: "Cormorant Garamond" o "Playfair Display" (elegante, serif)
- Script/Cursiva: "Dancing Script" o "Great Vibes" (para "Brunch" y acentos)
- Secundaria limpia: "Jost" o "Raleway" (textos y precios, sans-serif ligera)
- Retro/Display: "Abril Fatface" o "Bebas Neue" (para títulos impactantes)

ESTILO VISUAL:
- Glamuroso pero fresco, con toques vintage retro de los años 50, 60 y 70
- Evoca feminidad de manera ingenua y provocadora
- Colores pasteles brillantes con toques de dorado
- Tipografía retro pero simple y elegante
- Textos comprensibles, sin exceso de letra
- Mezcla entre: collage, fotografía de producto, post de solo texto, fotografía intervenida
- Inspiración cultural: francesa, italiana, europea con raíces latinas
- Lenguaje que evoque culturas del mundo: "bonjour madame", "c'est la vie", "ciao bella", "très chic"

FORMATOS:
- Post Instagram: 1080x1080px (cuadrado)
- Story Instagram: 1080x1920px (vertical 9:16)

LOGO: El logo de Matilde usa letras espaciadas en dorado/negro con "Brunch" en cursiva script debajo. Simúlalo con tipografía cuando lo necesites.

=== TU COMPORTAMIENTO ===

Cuando el usuario pida una pieza de diseño:
1. Responde con una descripción muy breve de tu concepto creativo (2-3 líneas máx)
2. Genera el HTML completo de la pieza dentro de un bloque de código con la etiqueta: \`\`\`html-design
3. El HTML debe ser autónomo, con estilos inline o en <style>, sin dependencias externas salvo Google Fonts
4. Usa @import de Google Fonts al inicio del <style>
5. El diseño debe ser pixel-perfect para el formato solicitado
6. Siempre incluye el logo/nombre "Matilde Brunch" en la pieza

TIPOS DE PIEZAS QUE PUEDES CREAR:
- Anuncio de nuevo plato
- Promoción o descuento
- Contenido educativo (métodos de café, culturas del mundo)
- Frase inspiracional / lifestyle
- Menú del día
- Anuncio de evento
- Story de encuesta o interacción
- Collage tipográfico

Si el usuario no especifica el formato, pregunta si quiere post o story.
Si no da texto específico, inventa uno alineado a la marca.
Siempre diseña con intención artística: composición, jerarquía, atmósfera.

Responde siempre en español.`;

const EXAMPLES = [
  "Post anunciando los Toffee Pancakes",
  "Story con frase inspiracional francesa",
  "Post de método de café Cold Brew",
  "Story anunciando brunch dominical",
  "Post collage tipográfico estilo retro",
  "Post menú del día lunch time",
];

function DesignPreview({ html }: { html: string }) {
  const iframeRef = useRef(null);
  const [isStory, setIsStory] = useState(false);

  useEffect(() => {
    setIsStory(html.toLowerCase().includes("1920") || html.toLowerCase().includes("story"));
  }, [html]);

  return (
    <div style={{ marginTop: "12px" }}>
      <div style={{
        display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center"
      }}>
        <span style={{ fontSize: "11px", color: "#9B7E5A", letterSpacing: "1px", textTransform: "uppercase" }}>
          {isStory ? "Story 9:16" : "Post 1:1"}
        </span>
        <button
          onClick={() => {
            const blob = new Blob([html], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = "matilde-design.html"; a.click();
          }}
          style={{
            background: "rgba(184,134,11,0.12)", border: "1px solid rgba(184,134,11,0.3)",
            borderRadius: "20px", color: "#8B6914", fontSize: "11px", padding: "3px 12px",
            cursor: "pointer", letterSpacing: "0.5px",
          }}
        >⬇ Descargar HTML</button>
      </div>
      <div style={{
        position: "relative",
        width: isStory ? "200px" : "300px",
        height: isStory ? "355px" : "300px",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        border: "2px solid rgba(184,134,11,0.2)",
      }}>
        <iframe
          ref={iframeRef}
          srcDoc={html}
          style={{
            width: isStory ? "540px" : "600px",
            height: isStory ? "960px" : "600px",
            border: "none",
            transformOrigin: "top left",
            transform: isStory ? "scale(0.37)" : "scale(0.5)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

function Message({ msg }: { msg: { role: string; content: string } }) {
  const parts = [];
  if (msg.role === "assistant") {
    const regex = /```html-design\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(msg.content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: msg.content.slice(lastIndex, match.index) });
      }
      parts.push({ type: "design", content: match[1] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < msg.content.length) {
      parts.push({ type: "text", content: msg.content.slice(lastIndex) });
    }
  }

const fmt = (text: string) => text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");

  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{
          maxWidth: "70%", padding: "11px 16px",
          background: "linear-gradient(135deg, #B8860B, #A0720A)",
          borderRadius: "18px 18px 4px 18px",
          color: "#FFF8E7", fontSize: "14px", lineHeight: "1.6",
          boxShadow: "0 3px 12px rgba(180,120,20,0.3)",
        }} dangerouslySetInnerHTML={{ __html: fmt(msg.content) }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
      <div style={{
        width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #E8A0B4, #B8860B)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "16px", boxShadow: "0 2px 8px rgba(180,120,80,0.3)",
      }}>🎨</div>
      <div style={{ maxWidth: "85%", display: "flex", flexDirection: "column", gap: "10px" }}>
        {parts.length > 0 ? parts.map((part, i) => (
          part.type === "text" ? (
            <div key={i} style={{
              padding: "12px 16px", background: "#FFF",
              borderRadius: "18px 18px 18px 4px",
              border: "1px solid rgba(184,134,11,0.12)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              color: "#4A3520", fontSize: "14px", lineHeight: "1.7",
            }} dangerouslySetInnerHTML={{ __html: fmt(part.content.trim()) }} />
          ) : (
            <div key={i} style={{
              padding: "16px",
              background: "rgba(232,160,180,0.08)",
              border: "1px solid rgba(184,134,11,0.15)",
              borderRadius: "16px",
            }}>
              <DesignPreview html={part.content} />
            </div>
          )
        )) : (
          <div style={{
            padding: "12px 16px", background: "#FFF",
            borderRadius: "18px 18px 18px 4px",
            border: "1px solid rgba(184,134,11,0.12)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            color: "#4A3520", fontSize: "14px", lineHeight: "1.7",
          }} dangerouslySetInnerHTML={{ __html: fmt(msg.content) }} />
        )}
      </div>
    </div>
  );
}

export default function MatildeDesigner() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "¡Hola! 🎨 Soy el diseñador de **Matilde Brunch**.\n\nEstoy completamente alineado con el manual de marca: colores pasteles, estilo retro glamuroso años 50-70, tipografía elegante, y esa energía latino-europea que define a Matilde.\n\nPídeme una pieza y la creo al instante — posts de Instagram, stories, anuncios, contenido de café, frases... ¿Qué diseñamos hoy?"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

const send = async (text?: string) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    const newMsgs = [...messages, { role: "user", content: userText }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map((b: { text?: string }) => b.text || "").join("") || "Error al generar el diseño.";
      setMessages([...newMsgs, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMsgs, { role: "assistant", content: "Ocurrió un error. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #fdf0f5 0%, #fdf8f0 40%, #f0f5f0 100%)",
      fontFamily: "'Georgia', serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: "780px",
        borderRadius: "24px", overflow: "hidden",
        boxShadow: "0 20px 60px rgba(180,100,120,0.15), 0 0 0 1px rgba(184,134,11,0.12)",
        display: "flex", flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)",
          padding: "28px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "6px" }}>Estudio de diseño</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span style={{ color: "#B8860B", fontSize: "28px", letterSpacing: "6px", textTransform: "uppercase", fontWeight: "300" }}>Matilde</span>
              <span style={{ color: "#B8860B", fontSize: "18px", fontStyle: "italic" }}>Brunch</span>
            </div>
            <div style={{ color: "rgba(184,134,11,0.5)", fontSize: "11px", letterSpacing: "2px", marginTop: "4px" }}>AGENTE DISEÑADOR IA</div>
          </div>
          <div style={{ textAlign: "right" }}>
            {["Posts", "Stories", "Eventos"].map((t, i) => (
              <div key={i} style={{
                display: "inline-block", margin: "2px 4px",
                background: "rgba(184,134,11,0.15)", borderRadius: "20px",
                padding: "3px 10px", color: "#B8860B", fontSize: "11px", letterSpacing: "0.5px",
              }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Color strip */}
        <div style={{ display: "flex", height: "4px" }}>
          {["#E8A0B4", "#A8C5A0", "#F5EDD0", "#E8622A", "#B8860B", "#1C4A3E"].map((c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ))}
        </div>

        {/* Messages */}
        <div style={{
          background: "#FEFCF8", overflowY: "auto",
          padding: "24px", minHeight: "420px", maxHeight: "500px",
          display: "flex", flexDirection: "column", gap: "18px",
        }}>
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}

          {loading && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "50%",
                background: "linear-gradient(135deg, #E8A0B4, #B8860B)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
              }}>🎨</div>
              <div style={{
                padding: "12px 18px", background: "#FFF",
                borderRadius: "18px 18px 18px 4px",
                border: "1px solid rgba(184,134,11,0.12)",
                display: "flex", gap: "5px", alignItems: "center",
              }}>
                <span style={{ color: "#9B7E5A", fontSize: "13px", fontStyle: "italic", marginRight: "8px" }}>Diseñando...</span>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: "7px", height: "7px", borderRadius: "50%",
                    background: "#E8A0B4",
                    animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Examples */}
        {messages.length <= 1 && (
          <div style={{ background: "#FEFCF8", padding: "0 20px 14px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {EXAMPLES.map((e, i) => (
              <button key={i} onClick={() => send(e)} style={{
                background: "rgba(232,160,180,0.1)", border: "1px solid rgba(232,160,180,0.35)",
                borderRadius: "20px", color: "#9B5C6E", fontSize: "12px",
                padding: "6px 14px", cursor: "pointer", fontFamily: "Georgia, serif",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,160,180,0.2)"}
onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,160,180,0.1)"}  
              >{e}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          background: "#F5EDD0",
          padding: "14px 20px 20px",
          borderTop: "1px solid rgba(184,134,11,0.12)",
          display: "flex", gap: "10px", alignItems: "flex-end",
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Pídeme una pieza: 'Post anunciando el fondue de chocolate' o 'Story con frase en francés'..."
            rows={2}
            style={{
              flex: 1, background: "#FFF",
              border: "1px solid rgba(184,134,11,0.25)", borderRadius: "14px",
              color: "#4A3520", fontSize: "14px", padding: "11px 16px",
              fontFamily: "Georgia, serif", resize: "none", outline: "none", lineHeight: "1.5",
            }}
            onFocus={e => e.target.style.borderColor = "#B8860B"}
            onBlur={e => e.target.style.borderColor = "rgba(184,134,11,0.25)"}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            width: "46px", height: "46px", borderRadius: "14px",
            background: loading || !input.trim() ? "rgba(184,134,11,0.15)" : "linear-gradient(135deg, #1A1A1A, #2D2D2D)",
            border: "none", color: loading || !input.trim() ? "rgba(139,105,20,0.4)" : "#B8860B",
            fontSize: "18px", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s", flexShrink: 0,
          }}>✦</button>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(184,134,11,0.2); border-radius: 2px; }
      `}</style>
    </div>
  );
}
