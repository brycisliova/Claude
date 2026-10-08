import { hero, icon } from "../layout.mjs";

export default {
  slug: "privacy",
  title: "Privacy and safety",
  accent: "b",
  desc: "What this site does and doesn't know about you: no tracking, no cookies, no ads. Plus practical steps for staying safe if you share a device or a home.",
  scripts: ["privacy"],
  body: (ctx) => `
${hero(ctx, { eyebrow: "Plain language", title: "Privacy <em class=\"grad\">and safety</em>", lede: "For many people, visiting a site like this is a risk in itself. So here is exactly what this site does, what it can't promise, and how to stay safer.", accent: "b" })}

<section class="section">
  <div class="wrap narrow prose">
    <h2 style="margin-top:0">What this site does</h2>
    <ul>
      <li><strong>No tracking.</strong> No analytics, no advertising, no cookies, no social-media buttons or pixels.</li>
      <li><strong>No third-party fonts.</strong> Fonts are served from this site itself, so your browser doesn't contact Google or anyone else to draw the page.</li>
      <li><strong>Videos load only when you press play.</strong> They then come from YouTube's privacy-enhanced mode (youtube-nocookie.com).</li>
      <li><strong>Your writing and mood check-ins stay on your device.</strong> They're saved in your browser's local storage, not sent anywhere.</li>
      <li><strong>Sounds and games run in your browser.</strong> Nothing is uploaded.</li>
    </ul>

    <h2>What this site can't promise</h2>
    <ul>
      <li><strong>The host sees visits.</strong> This site is hosted on GitHub Pages. Like any web host, GitHub may log technical details such as IP addresses; see GitHub's own privacy statement.</li>
      <li><strong>Forms use a delivery service.</strong> Anonymous messages and contact forms are passed through a third-party form service to reach the builder's inbox. We never ask for your name or email in the anonymous form, but please don't include details that could identify you.</li>
      <li><strong>Your browser keeps history.</strong> Anyone with access to your device can see that you visited unless you take the steps below.</li>
      <li><strong>External links leave this site.</strong> Other sites have their own rules.</li>
    </ul>

    <h2>If you share a device or a home</h2>
    <ol class="steps">
      <li><strong>Use a private window.</strong> Incognito or private browsing doesn't save history or local storage when you close it. It doesn't hide you from a network owner or a monitored device.</li>
      <li><strong>Use Quick exit.</strong> The red button at the bottom left, or pressing <kbd>Esc</kbd> three times, jumps straight to a neutral site and replaces this page in your history.</li>
      <li><strong>Clear what you saved.</strong> Press the button below to remove your theme, journal and mood data from this browser, then clear your browsing history from your browser's settings.</li>
      <li><strong>Mind your notifications and sync.</strong> If your browser or phone syncs history to an account someone else can see, a private window is safer.</li>
      <li><strong>Trust your instincts.</strong> If a device is monitored, use a friend's phone or a library computer instead.</li>
    </ol>
    <p><button class="btn btn-primary" id="wipe">Clear everything this site saved on this device</button></p>
    <p class="status" id="wipeMsg" aria-live="polite"></p>

    <h2>Report a problem</h2>
    <p>Found something wrong, unsafe, or unkind on this site? Write to <a href="mailto:${ctx.config.email}">${ctx.config.email}</a> and it will be looked at.</p>
  </div>
</section>`
};
