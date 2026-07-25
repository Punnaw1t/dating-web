"use client";

import { useEffect, useRef, useState } from "react";

type ScreenId = "s1" | "s2" | "s3" | "s4" | "s5";
type Choice = { emoji: string; name: string; sub: string } | null;

type PlanData = {
  menu: Choice;
  place: Choice;
  dateStr: string;
  loc: string;
};

const TARGET = "punnawich.kanokpornwanich@gmail.com";

const refuses = [
  "That button keeps running away~ 😏",
  "Getting harder to catch, isn't it? 🤭",
  "Try again… if you can!",
  "It ran away again~ don't give up!",
  "The Date button is waiting for you 💕",
  "So fast! But you can't catch it 🌸",
];

const memes = ["🥺", "😂", "💀", "🤡", "😭", "🫣", "🙈", "😤", "🤣", "😩", "🫠", "🥲", "😅", "🤦", "🫡", "😬", "🙃", "👀", "🤪", "😳", "🫢", "💅", "🤌", "🫶"];

const timeGroups = [
  { label: "Morning", slots: ["09:00", "10:00", "11:00"] },
  { label: "Noon", slots: ["12:00", "13:00"] },
  { label: "Afternoon", slots: ["14:00", "15:00", "16:00"] },
  { label: "Evening", slots: ["17:00", "18:00", "19:00"] },
  { label: "Night", slots: ["20:00", "21:00", "22:00"] },
];

function randomMeme(current: string) {
  const pool = memes.filter((m) => m !== current);
  return pool[Math.floor(Math.random() * pool.length)];
}

function fmtDate(date: string, time: string | null) {
  if (!date || !time) return "";
  return `${new Date(`${date}T${time}:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })} at ${time}`;
}

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("s1");
  const [refuseMessage, setRefuseMessage] = useState("");
  const [heroEmoji, setHeroEmoji] = useState("🥺");
  const [choices, setChoices] = useState<{ menu: Choice; place: Choice }>({ menu: null, place: null });
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [dateValue, setDateValue] = useState("");
  const [location, setLocation] = useState("");
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [emailState, setEmailState] = useState<"idle" | "sending" | "ready">("idle");
  const [emailMessage, setEmailMessage] = useState("");
  const [mailtoLink, setMailtoLink] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownText, setDropdownText] = useState("Pick time");
  const [runCount, setRunCount] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const noButtonRef = useRef<HTMLButtonElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const readyMenu = Boolean(choices.menu);
  const readyPlace = Boolean(choices.place);
  const readyDateTime = Boolean(dateValue && selectedTime && location.trim());

  const go = (id: ScreenId) => {
    setActiveScreen(id);
    setDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pickChoice = (type: "menu" | "place", emoji: string, name: string, sub: string) => {
    setChoices((prev) => ({ ...prev, [type]: { emoji, name, sub } }));
  };

  const handleRunAway = () => {
    const button = noButtonRef.current;
    const container = containerRef.current;
    if (!button || !container) return;

    if (button.parentElement !== container) {
      container.appendChild(button);
    }

    button.style.position = "absolute";

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const buttonWidth = button.offsetWidth || 100;
    const buttonHeight = button.offsetHeight || 44;
    const padding = 16;

    const maxX = Math.max(0, containerWidth - buttonWidth - padding);
    const maxY = Math.max(0, containerHeight - buttonHeight - padding);
    const currentX = button.offsetLeft;
    const currentY = button.offsetTop;

    let x = padding + Math.random() * Math.max(0, maxX - padding);
    let y = padding + Math.random() * Math.max(0, maxY - padding);
    let attempts = 0;

    while (attempts < 30 && Math.abs(x - currentX) < 80 && Math.abs(y - currentY) < 50) {
      x = padding + Math.random() * Math.max(0, maxX - padding);
      y = padding + Math.random() * Math.max(0, maxY - padding);
      attempts += 1;
    }

    x = Math.max(padding, Math.min(x, maxX));
    y = Math.max(padding, Math.min(y, maxY));

    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    button.style.transition = "left 0.2s ease, top 0.2s ease";

    const nextCount = runCount + 1;
    setRunCount(nextCount);
    setRefuseMessage(refuses[nextCount % refuses.length]);
    setHeroEmoji(randomMeme(heroEmoji));
  };

  const toggleDD = () => setDropdownOpen((prev) => !prev);

  const pickTime = (time: string) => {
    setSelectedTime(time);
    setDropdownText(time);
    setDropdownOpen(false);
  };

  const handleGoResult = () => {
    const menu = choices.menu || { emoji: "🍽️", name: "Dinner", sub: "" };
    const place = choices.place || { emoji: "📍", name: "Somewhere", sub: "" };
    const dateStr = fmtDate(dateValue, selectedTime);
    const loc = location.trim();

    setPlanData({ menu, place, dateStr, loc });
    setEmailState("idle");
    setEmailMessage("");
    setMailtoLink("");
    go("s5");
  };

  const sendEmail = () => {
    if (!planData) return;

    setEmailState("sending");
    setEmailMessage("Preparing your invitation...");

    const { menu, place, dateStr, loc } = planData;
    const body = `💌 A Special Date Invitation 💌\n\nHey there 🌸\n\nI'd love to take you out on a date — here's the plan!\n\n🍽️  Dinner: ${menu?.emoji} ${menu?.name}\n     ${menu?.sub}\n\n🗺️  After dinner: ${place?.emoji} ${place?.name}\n     ${place?.sub}\n\n📅  When: ${dateStr}\n\n📍  Meeting spot: ${loc}\n\nCan't wait to see you! 💕\n— Sent with love 🌹`;
    const subject = "💌 A Special Date Invitation Just for You 🌸";
    const mailto = `mailto:${TARGET}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setMailtoLink(mailto);

    window.setTimeout(() => {
      setEmailState("ready");
      setEmailMessage("✅ Ready to send!");
    }, 800);
  };

  const restart = () => {
    const button = noButtonRef.current;
    const row = rowRef.current;

    if (button && row && button.parentElement !== row) {
      row.appendChild(button);
    }

    if (button) {
      button.style.position = "";
      button.style.left = "";
      button.style.top = "";
      button.style.transition = "none";
    }

    setRefuseMessage("");
    setHeroEmoji("🥺");
    setChoices({ menu: null, place: null });
    setSelectedTime(null);
    setDateValue("");
    setLocation("");
    setPlanData(null);
    setEmailState("idle");
    setEmailMessage("");
    setMailtoLink("");
    setDropdownText("Pick time");
    setRunCount(0);
    go("s1");
  };

  return (
    <div id="app" ref={containerRef}>
      <div className="bg-layer" />
      <div className="petals">
        <div className="petal">🌸</div>
        <div className="petal">🌷</div>
        <div className="petal">✨</div>
        <div className="petal">💮</div>
        <div className="petal">🌸</div>
        <div className="petal">🌷</div>
        <div className="petal">💕</div>
        <div className="petal">✨</div>
      </div>

      <div className={`screen ${activeScreen === "s1" ? "active" : ""}`} id="s1">
        <div className="hero-emoji">{heroEmoji}</div>
        <div className="title-tag">💌 special invite</div>
        <h1>Wanna go on a date with me?</h1>
        <p className="subtitle">I have something special planned for us<br />I promise it&apos;ll be wonderful 💕</p>
        <div className="btn-row" ref={rowRef}>
          <button className="btn-date" onClick={() => go("s2")}>💖 Yes, Date!</button>
          <button id="btn-not" ref={noButtonRef} onMouseOver={handleRunAway} onTouchStart={handleRunAway}>🙅 No</button>
        </div>
        <p className="refuse-msg">{refuseMessage}</p>
      </div>

      <div className={`screen ${activeScreen === "s2" ? "active" : ""}`} id="s2">
        <div className="steps">
          <div className="step-dot active" />
          <div className="step-dot" />
          <div className="step-dot" />
          <div className="step-dot" />
        </div>
        <div className="section-badge">
          <span className="section-emoji">🍽️</span>
          <span className="section-title">What would you like to eat?</span>
        </div>
        <p className="section-sub">Pick whatever you fancy — I&apos;ll take care of the rest 😊</p>
        <div className="card-grid">
          <div className={`sel-card ${choices.menu?.name === "Sushi & Omakase" ? "selected" : ""}`} onClick={() => pickChoice("menu", "🍣", "Sushi & Omakase", "Japanese, romantic & refined")}>
            <div className="card-emoji">🍣</div>
            <div className="card-name">Sushi & Omakase</div>
            <div className="card-desc">Romantic & refined</div>
          </div>
          <div className={`sel-card ${choices.menu?.name === "Pasta & Steak" ? "selected" : ""}`} onClick={() => pickChoice("menu", "🍝", "Pasta & Steak", "Italian, candlelit ambiance")}>
            <div className="card-emoji">🍝</div>
            <div className="card-name">Pasta & Steak</div>
            <div className="card-desc">Candlelit ambiance</div>
          </div>
          <div className={`sel-card ${choices.menu?.name === "Ramen & Izakaya" ? "selected" : ""}`} onClick={() => pickChoice("menu", "🍜", "Ramen & Izakaya", "Cosy, laid-back & fun")}>
            <div className="card-emoji">🍜</div>
            <div className="card-name">Ramen & Izakaya</div>
            <div className="card-desc">Cosy & laid-back</div>
          </div>
          <div className={`sel-card ${choices.menu?.name === "BBQ & Grill" ? "selected" : ""}`} onClick={() => pickChoice("menu", "🥩", "BBQ & Grill", "Warm vibes, grill together")}>
            <div className="card-emoji">🥩</div>
            <div className="card-name">BBQ & Grill</div>
            <div className="card-desc">Grill together, cosy</div>
          </div>
          <div className={`sel-card ${choices.menu?.name === "Café & Desserts" ? "selected" : ""}`} onClick={() => pickChoice("menu", "🧁", "Café & Desserts", "Sweet just like you 🍰")}>
            <div className="card-emoji">🧁</div>
            <div className="card-name">Café & Desserts</div>
            <div className="card-desc">Sweet just like you</div>
          </div>
          <div className={`sel-card ${choices.menu?.name === "Mexican & Tacos" ? "selected" : ""}`} onClick={() => pickChoice("menu", "🌮", "Mexican & Tacos", "Vibrant, fun & colourful")}>
            <div className="card-emoji">🌮</div>
            <div className="card-name">Mexican & Tacos</div>
            <div className="card-desc">Vibrant & fun</div>
          </div>
        </div>
        <button className={`action-btn ${readyMenu ? "ready" : ""}`} onClick={() => go("s3")}>Next →</button>
        <button className="ghost-btn" onClick={() => go("s1")}>↩ Back</button>
      </div>

      <div className={`screen ${activeScreen === "s3" ? "active" : ""}`} id="s3">
        <div className="steps">
          <div className="step-dot done" />
          <div className="step-dot active" />
          <div className="step-dot" />
          <div className="step-dot" />
        </div>
        <div className="section-badge">
          <span className="section-emoji">🗺️</span>
          <span className="section-title">What kind of place after?</span>
        </div>
        <p className="section-sub">We&apos;ll head there right after dinner ☺️</p>
        <div className="card-grid">
          <div className={`sel-card ${choices.place?.name === "Riverside / Sunset View" ? "selected" : ""}`} onClick={() => pickChoice("place", "🌅", "Riverside / Sunset View", "Romantic, perfect for couple photos")}>
            <div className="card-emoji">🌅</div>
            <div className="card-name">Riverside / Sunset View</div>
            <div className="card-desc">Romantic & scenic</div>
          </div>
          <div className={`sel-card ${choices.place?.name === "Rooftop / City View" ? "selected" : ""}`} onClick={() => pickChoice("place", "🏙️", "Rooftop / City View", "City lights & night sky")}>
            <div className="card-emoji">🏙️</div>
            <div className="card-name">Rooftop / City View</div>
            <div className="card-desc">City lights at night</div>
          </div>
          <div className={`sel-card ${choices.place?.name === "Park / Nature" ? "selected" : ""}`} onClick={() => pickChoice("place", "🌳", "Park / Nature", "Stroll together, fresh air")}>
            <div className="card-emoji">🌳</div>
            <div className="card-name">Park / Nature</div>
            <div className="card-desc">Stroll & fresh air</div>
          </div>
          <div className={`sel-card ${choices.place?.name === "Amusement Park" ? "selected" : ""}`} onClick={() => pickChoice("place", "🎡", "Amusement Park", "Fun, exciting & memorable")}>
            <div className="card-emoji">🎡</div>
            <div className="card-name">Amusement Park</div>
            <div className="card-desc">Fun & exciting</div>
          </div>
          <div className={`sel-card ${choices.place?.name === "Cinema / Show" ? "selected" : ""}`} onClick={() => pickChoice("place", "🎬", "Cinema / Show", "Sit close, cosy together")}>
            <div className="card-emoji">🎬</div>
            <div className="card-name">Cinema / Show</div>
            <div className="card-desc">Cosy & close</div>
          </div>
          <div className={`sel-card ${choices.place?.name === "Shopping / Market" ? "selected" : ""}`} onClick={() => pickChoice("place", "🛍️", "Shopping / Market", "Chill walk & good chat")}>
            <div className="card-emoji">🛍️</div>
            <div className="card-name">Shopping / Market</div>
            <div className="card-desc">Chill & chatty</div>
          </div>
        </div>
        <button className={`action-btn ${readyPlace ? "ready" : ""}`} onClick={() => go("s4")}>Next →</button>
        <button className="ghost-btn" onClick={() => go("s2")}>↩ Back</button>
      </div>

      <div className={`screen ${activeScreen === "s4" ? "active" : ""}`} id="s4">
        <div className="steps">
          <div className="step-dot done" />
          <div className="step-dot done" />
          <div className="step-dot active" />
          <div className="step-dot" />
        </div>
        <div className="section-badge">
          <span className="section-emoji">📅</span>
          <span className="section-title">When & where shall we meet?</span>
        </div>
        <p className="section-sub">Fill in the details and we&apos;re all set 💕</p>
        <div className="form-box">
          <div className="form-row">
            <div>
              <div className="field-label">📆 Date *</div>
              <input type="date" className="cute-input" value={dateValue} onChange={(e) => setDateValue(e.target.value)} />
            </div>
            <div>
              <div className="field-label">🕐 Time *</div>
              <div className="custom-dd" ref={dropdownRef}>
                <div className={`dd-trigger ${dropdownOpen ? "open" : ""}`} onClick={toggleDD}>
                  <span className={dropdownText === "Pick time" ? "dd-placeholder" : "dd-value"}>{dropdownText}</span>
                  <span className="dd-arrow">▼</span>
                </div>
                <div className={`dd-menu ${dropdownOpen ? "open" : ""}`}>
                  {timeGroups.map((group) => (
                    <div key={group.label}>
                      <div className="dd-group-label">{group.label}</div>
                      {group.slots.map((time) => (
                        <div key={time} className={`dd-item ${selectedTime === time ? "selected" : ""}`} onClick={() => pickTime(time)}>
                          <span>{time}</span>
                          <span className="dd-item-period">{group.label}</span>
                          {selectedTime === time ? <span className="dd-check">✓</span> : null}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="field-label">📍 Meeting spot *</div>
            <input type="text" className="cute-input" placeholder="e.g. Main entrance of Central World" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
        <button className={`action-btn ${readyDateTime ? "ready" : ""}`} onClick={handleGoResult}>See the plan ✨</button>
        <button className="ghost-btn" onClick={() => go("s3")}>↩ Back</button>
      </div>

      <div className={`screen ${activeScreen === "s5" ? "active" : ""}`} id="s5">
        <div className="steps">
          <div className="step-dot done" />
          <div className="step-dot done" />
          <div className="step-dot done" />
          <div className="step-dot active" />
        </div>
        <div className="result-wrap">
          <div className="confetti-row">🎉🌹💕🌹🎉</div>
          <p className="result-title">Our Date Plan 💑</p>
          <div className="plan-card">
            <div className="plan-row">
              <div className="plan-icon">{planData?.menu?.emoji || "🍽️"}</div>
              <div>
                <div className="plan-label">Dinner</div>
                <div className="plan-value">{planData?.menu?.name || "Dinner"}</div>
                <div className="plan-sub">{planData?.menu?.sub || ""}</div>
              </div>
            </div>
            <div className="plan-row">
              <div className="plan-icon">{planData?.place?.emoji || "📍"}</div>
              <div>
                <div className="plan-label">After dinner</div>
                <div className="plan-value">{planData?.place?.name || "Somewhere"}</div>
                <div className="plan-sub">{planData?.place?.sub || ""}</div>
              </div>
            </div>
            <div className="plan-row">
              <div className="plan-icon">📅</div>
              <div>
                <div className="plan-label">Date & Time</div>
                <div className="plan-value">{planData?.dateStr || ""}</div>
              </div>
            </div>
            <div className="plan-row">
              <div className="plan-icon">📍</div>
              <div>
                <div className="plan-label">Meeting spot</div>
                <div className="plan-value">{planData?.loc || ""}</div>
              </div>
            </div>
          </div>
          <button className="send-btn" onClick={sendEmail} disabled={emailState === "sending"}>
            <span>💌</span>
            <span>{emailState === "ready" ? "All set!" : emailState === "sending" ? "Preparing..." : "Send the Invite!"}</span>
          </button>
          {emailMessage ? (
            <div className={`email-status ${emailState === "sending" ? "sending" : emailState === "ready" ? "ok" : ""}`}>
              {emailState === "sending" ? <span className="loader" /> : null}
              <span>{emailMessage}</span>
              {mailtoLink && emailState === "ready" ? (
                <>
                  {" "}
                  <a href={mailtoLink} style={{ color: "#2E5C08", fontWeight: 800, textDecoration: "underline" }}>
                    📨 Click here to send the email
                  </a>
                </>
              ) : null}
            </div>
          ) : null}
          <button className="restart-btn" onClick={restart}>↩ Start over</button>
        </div>
      </div>
    </div>
  );
}
