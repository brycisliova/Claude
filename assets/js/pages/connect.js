import { $ } from "../core.js";
import { FORMS } from "../config.js";

const configured = !!(FORMS.web3formsKey || FORMS.formspreeId);

function setStatus(el, msg, ok) { el.textContent = msg; el.className = "status " + (ok ? "ok" : "err"); }

async function deliver(payload) {
  if (FORMS.formspreeId) {
    const r = await fetch(`https://formspree.io/f/${encodeURIComponent(FORMS.formspreeId)}`, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error("formspree " + r.status);
    return;
  }
  const r = await fetch("https://api.web3forms.com/submit", {
    method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ access_key: FORMS.web3formsKey, ...payload })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) throw new Error("web3forms");
}

/* ----- anonymous message ----- */
const anon = $("#anonForm");
$("#anonText").addEventListener("input", (e) => { $("#anonCount").textContent = `${e.target.value.length} / 600`; });
if (!configured) $("#anonOffline").hidden = false;
anon.addEventListener("submit", async (e) => {
  e.preventDefault();
  const st = $("#anonStatus"), text = $("#anonText").value.trim();
  if ($("#anonHp").value) return;
  if (text.length < 3) return setStatus(st, "Please write a little more.", false);
  if (!configured) return setStatus(st, "Anonymous sending isn't switched on yet. You can email instead, but that isn't anonymous.", false);
  const btn = $("#anonSend"); btn.disabled = true;
  try {
    await deliver({ subject: "Who We Are: anonymous message", from_name: "Anonymous visitor", kind: $("#anonKind").value, message: text.slice(0, 600) });
    $("#anonText").value = ""; $("#anonCount").textContent = "0 / 600";
    setStatus(st, "Sent. Thank you for trusting this space. It will be read with care.", true);
  } catch (err) {
    setStatus(st, "Couldn't send right now. Please try again in a moment.", false);
  }
  btn.disabled = false;
});

/* ----- contact the builder ----- */
const form = $("#contactForm");
const mailHref = () => {
  const body = `Name: ${$("#cName").value}\nReply to: ${$("#cEmail").value}\nAbout: ${$("#cType").value}\n\n${$("#cMsg").value}`;
  return `mailto:${FORMS.email}?subject=${encodeURIComponent("Who We Are: " + $("#cType").value)}&body=${encodeURIComponent(body)}`;
};
["#cName", "#cEmail", "#cType", "#cMsg"].forEach((s) => $(s).addEventListener("input", () => { $("#cMail").href = mailHref(); }));
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const st = $("#cStatus"), msg = $("#cMsg").value.trim();
  if ($("#cHp").value) return;
  if (msg.length < 3) return setStatus(st, "Please add a message.", false);
  if (!configured) { location.href = mailHref(); return setStatus(st, "Opening your email app. Forms aren't switched on yet.", true); }
  const btn = $("#cSend"); btn.disabled = true;
  try {
    await deliver({ subject: "Who We Are: " + $("#cType").value, from_name: $("#cName").value.trim() || "Visitor", email: $("#cEmail").value.trim() || undefined, message: msg.slice(0, 1500) });
    ["#cName", "#cEmail", "#cMsg"].forEach((s) => ($(s).value = ""));
    setStatus(st, "Sent. Thank you for reaching out.", true);
  } catch (err) {
    setStatus(st, "Couldn't send right now. Try again, or use the email button.", false);
  }
  btn.disabled = false;
});
