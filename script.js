(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const windowsLayer = $("#windowsLayer");
  const taskbarApps = $("#taskbarApps");
  const startMenu = $("#startMenu");
  const toast = $("#toast");
  const appMeta = {
    about:{title:"About VarunOS",icon:"V",iconClass:"icon-about"},
    notes:{title:"Notes",icon:"✎",iconClass:"icon-notes"},
    files:{title:"File Explorer",icon:"▰",iconClass:"icon-files"},
    terminal:{title:"Terminal",icon:"$_",iconClass:"icon-terminal"},
    settings:{title:"Settings",icon:"⚙",iconClass:"icon-settings"},
    calculator:{title:"Calculator",icon:"＋",iconClass:"icon-calc"}
  };
  const openWindows = new Map();
  let zIndex = 10;
  let toastTimer;
  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function notify(message) {
    toast.textContent = message; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
  }
  function appContent(id) {
    switch(id) {
      case "about": return `<h2>Welcome to VarunOS</h2><p>A desktop-inspired web workspace built as a learning project. It runs inside your browser; it is not a replacement for Windows or a bootable operating system.</p><div class="stat-row"><div class="stat"><strong>6</strong><span>Built-in apps</span></div><div class="stat"><strong>Local</strong><span>Browser storage</span></div><div class="stat"><strong>v1.0</strong><span>Web edition</span></div></div><h3>Project goals</h3><p>Explore interface design, JavaScript interactions, local persistence, and the basics of building a desktop-like experience.</p><button class="small-btn" data-action="show-toast" data-message="Thanks for exploring VarunOS!">Got it</button>`;
      case "notes": return `<h2>Notes</h2><p>Your note is saved automatically in this browser on this device.</p><textarea id="notesArea" class="notes-area" placeholder="Write an idea, task, or reminder..."></textarea><div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:9px"><span id="notesStatus" style="color:var(--muted);font-size:10px">Saved locally in this browser</span><button class="small-btn" data-action="clear-notes">Clear notes</button></div>`;
      case "files": return `<h2>File Explorer</h2><p>This demo shows sample folders. It cannot browse your computer's real files from a normal web page.</p><div class="file-list"><div class="file-row"><span>📁</span><div><strong>Documents</strong><small>Sample folder · 3 items</small></div></div><div class="file-row"><span>📁</span><div><strong>Projects</strong><small>Sample folder · VarunOS, experiments</small></div></div><div class="file-row"><span>📁</span><div><strong>Downloads</strong><small>Sample folder · 2 items</small></div></div><div class="file-row"><span>📄</span><div><strong>Readme.txt</strong><small>Welcome to the VarunOS demo</small></div></div></div>`;
      case "terminal": return `<h2>Terminal</h2><p>A simulated terminal for demo commands; it does not execute operating-system commands.</p><div id="terminalOutput" class="terminal-output">VarunOS Web Terminal [demo]\nType "help" to see available commands.\n</div><form id="terminalForm" class="terminal-form"><input id="terminalInput" autocomplete="off" placeholder="Enter command..." aria-label="Terminal command"><button class="small-btn" type="submit">Run</button></form>`;
      case "settings": return `<h2>Settings</h2><p>Personalize your workspace.</p><div class="setting-row"><label for="themeSelect">Appearance</label><select id="themeSelect"><option value="dark">Midnight dark</option><option value="light">Light mode</option></select></div><div class="setting-row"><label for="accentSelect">Accent color</label><select id="accentSelect"><option value="violet">Violet / aqua</option><option value="blue">Blue</option><option value="green">Green</option></select></div><div class="setting-row"><label for="motionToggle">Reduce visual effects</label><input id="motionToggle" type="checkbox"></div><p id="settingsStatus">Settings are saved in this browser.</p>`;
      case "calculator": return `<h2>Calculator</h2><input id="calcDisplay" class="calc-display" value="0" readonly aria-label="Calculator display"><div class="calc-grid">${["C","(",")","÷","7","8","9","×","4","5","6","−","1","2","3","+","±","0",".","="].map(k=>`<button type="button" data-calc="${k}">${k}</button>`).join("")}</div>`;
      default: return "<p>App not found.</p>";
    }
  }
  function bringToFront(win) { zIndex++; win.style.zIndex = zIndex; }
  function makeDraggable(win) {
    const bar = $(".window-titlebar", win);
    let startX=0,startY=0,origX=0,origY=0,dragging=false;
    bar.addEventListener("pointerdown", e => {
      if(e.target.closest("button")) return;
      dragging=true; bringToFront(win); startX=e.clientX;startY=e.clientY;
      const rect=win.getBoundingClientRect(); origX=rect.left;origY=rect.top;
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener("pointermove", e => {
      if(!dragging)return;
      const maxX=window.innerWidth-win.offsetWidth-8, maxY=window.innerHeight-win.offsetHeight-68;
      win.style.left=Math.max(8,Math.min(maxX,origX+e.clientX-startX))+"px";
      win.style.top=Math.max(65,Math.min(maxY,origY+e.clientY-startY))+"px";
    });
    bar.addEventListener("pointerup",()=>dragging=false);
    bar.addEventListener("pointercancel",()=>dragging=false);
  }
  function openApp(id) {
    if(!appMeta[id]) return;
    startMenu.classList.add("hidden");
    if(openWindows.has(id)) { const existing=openWindows.get(id); existing.classList.remove("hidden");bringToFront(existing);return; }
    const meta=appMeta[id], win=document.createElement("section");
    win.className="app-window";win.dataset.app=id;win.setAttribute("aria-label",meta.title);
    win.style.left=Math.max(12,Math.min(window.innerWidth-540,150+openWindows.size*28))+"px";
    win.style.top=Math.max(70,Math.min(window.innerHeight-470,78+openWindows.size*25))+"px";
    win.style.zIndex=++zIndex;
    win.innerHTML=`<div class="window-titlebar"><div class="window-title"><span class="mini-icon ${meta.iconClass}">${meta.icon}</span>${meta.title}</div><div class="window-controls"><button data-window="minimize" title="Minimize" aria-label="Minimize">—</button><button data-window="close" title="Close" aria-label="Close">×</button></div></div><div class="window-content">${appContent(id)}</div>`;
    windowsLayer.appendChild(win);openWindows.set(id,win);makeDraggable(win);
    const task=document.createElement("button");task.className="task-app active";task.dataset.task=id;task.innerHTML=`<span class="mini-icon ${meta.iconClass}">${meta.icon}</span><span>${meta.title}</span>`;task.addEventListener("click",()=>{if(win.classList.contains("hidden"))win.classList.remove("hidden");bringToFront(win);});taskbarApps.appendChild(task);
    win.addEventListener("pointerdown",()=>bringToFront(win));
    win.addEventListener("click",e=>{
      const ctrl=e.target.closest("[data-window]");
      if(ctrl){if(ctrl.dataset.window==="close"){win.remove();openWindows.delete(id);task.remove();}else{win.classList.add("hidden");task.classList.remove("active");}return;}
      const action=e.target.closest("[data-action]")?.dataset.action;
      if(action==="show-toast")notify(e.target.closest("[data-action]").dataset.message||"Done");
      if(action==="clear-notes"){localStorage.removeItem("varunos-notes");const area=$("#notesArea",win);if(area)area.value="";notify("Notes cleared");}
      const calc=e.target.closest("[data-calc]");if(calc) handleCalc(win,calc.dataset.calc);
    });
    if(id==="notes") {
      const area=$("#notesArea",win), status=$("#notesStatus",win);
      try{area.value=localStorage.getItem("varunos-notes")||"";}catch{}
      area.addEventListener("input",()=>{try{localStorage.setItem("varunos-notes",area.value);status.textContent="Saved locally";}catch{status.textContent="Storage unavailable";}});
    }
    if(id==="terminal") {
      const form=$("#terminalForm",win), input=$("#terminalInput",win), output=$("#terminalOutput",win);
      form.addEventListener("submit",e=>{e.preventDefault();const cmd=input.value.trim();if(!cmd)return;let answer;
        const commands={help:"Available commands: help, date, about, projects, clear, whoami",date:new Date().toString(),about:"VarunOS Web Edition — a browser-based desktop UI demo.",projects:"Current demo project: VarunOS",whoami:"guest@varunos-web"};
        if(cmd==="clear"){output.textContent="";input.value="";return;}
        answer=commands[cmd.toLowerCase()]||`Command not found: ${cmd}\nType "help" for supported demo commands.`;
        output.textContent+=`\n> ${cmd}\n${answer}\n`;output.scrollTop=output.scrollHeight;input.value="";
      });
    }
    if(id==="settings") {
      const theme=$("#themeSelect",win), accent=$("#accentSelect",win), motion=$("#motionToggle",win);
      try{theme.value=localStorage.getItem("varunos-theme")||"dark";accent.value=localStorage.getItem("varunos-accent")||"violet";motion.checked=localStorage.getItem("varunos-motion")==="true";}catch{}
      const apply=()=>{document.body.classList.toggle("light",theme.value==="light");const colors={violet:["#8b9dff","#57e3d0"],blue:["#68a9ff","#5ee7ff"],green:["#70e3a2","#a4f0c8"]};document.documentElement.style.setProperty("--accent",colors[accent.value][0]);document.documentElement.style.setProperty("--accent2",colors[accent.value][1]);document.body.style.setProperty("scroll-behavior",motion.checked?"auto":"smooth");try{localStorage.setItem("varunos-theme",theme.value);localStorage.setItem("varunos-accent",accent.value);localStorage.setItem("varunos-motion",String(motion.checked));}catch{}};
      theme.addEventListener("change",apply);accent.addEventListener("change",apply);motion.addEventListener("change",apply);apply();
    }
  }
  function handleCalc(win,key) {
    const display=$("#calcDisplay",win);let expr=display.dataset.expr||"";
    if(key==="C"){expr="";display.value="0";}
    else if(key==="="){
      try{const safe=expr.replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-");if(!safe||!/^[0-9+\-*/().\s]+$/.test(safe))throw Error();const result=Function('"use strict";return ('+safe+')')();if(!Number.isFinite(result))throw Error();expr=String(result);display.value=expr;}catch{display.value="Error";expr="";}
    } else if(key==="±"){if(expr.startsWith("-"))expr=expr.slice(1);else expr="-"+expr;display.value=expr||"0";}
    else {expr+=key;display.value=expr;}
    display.dataset.expr=expr;
  }
  $$("[data-open]").forEach(btn=>btn.addEventListener("click",()=>openApp(btn.dataset.open)));
  $("#startButton").addEventListener("click",()=>startMenu.classList.toggle("hidden"));
  $("#closeStart").addEventListener("click",()=>startMenu.classList.add("hidden"));
  $("#appSearch").addEventListener("input",e=>{const q=e.target.value.toLowerCase();$$(".start-apps button").forEach(b=>b.style.display=b.textContent.toLowerCase().includes(q)?"flex":"none");});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")startMenu.classList.add("hidden");if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();startMenu.classList.remove("hidden");$("#appSearch").focus();}});
  function updateClock(){const now=new Date();const time=now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});$("#clock").textContent=time;$("#trayClock").textContent=time;$("#dateLabel").textContent=now.toLocaleDateString([], {weekday:"short",month:"short",day:"numeric"});}
  updateClock();setInterval(updateClock,30000);
  try{document.body.classList.toggle("light",localStorage.getItem("varunos-theme")==="light");}catch{}
})();