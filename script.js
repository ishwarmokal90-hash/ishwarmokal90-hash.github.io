(() => {
  const $ = id => document.getElementById(id);
  const STORE_KEY = "ishwarDaily.v1";
  const todayISO = new Date().toISOString().slice(0,10);
  const defaultData = { tasks: [], expenses: [], notes: [], reminders: [], shopping: [] };
  let data;
  try { data = { ...defaultData, ...JSON.parse(localStorage.getItem(STORE_KEY) || "{}") }; }
  catch { data = { ...defaultData }; }
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch {} };
  const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let toastTimer;
  function toast(message) { const el=$("toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2400); }
  function empty(message) { return `<div class="empty-state">${escapeHTML(message)}</div>`; }
  function money(value) { return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(value); }
  function dateLabel(iso) { if(!iso) return ""; const d=new Date(iso+"T12:00:00"); return isNaN(d) ? iso : d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); }
  function renderTasks() {
    const root=$("taskList");
    root.innerHTML = data.tasks.length ? data.tasks.map(t=>`<div class="list-row ${t.done?'done':''}"><input class="check" type="checkbox" data-task-check="${t.id}" ${t.done?'checked':''} aria-label="Mark task complete"><div class="row-text"><strong>${escapeHTML(t.text)}</strong><small>${t.done?'Completed':'To do'}</small></div><button class="delete-button" data-task-delete="${t.id}" aria-label="Delete task">×</button></div>`).join("") : empty("No tasks yet. Add one small thing to start.");
    root.querySelectorAll("[data-task-check]").forEach(el=>el.addEventListener("change",()=>{const t=data.tasks.find(x=>x.id===el.dataset.taskCheck);if(t)t.done=el.checked;save();renderTasks();}));
    root.querySelectorAll("[data-task-delete]").forEach(el=>el.addEventListener("click",()=>{data.tasks=data.tasks.filter(x=>x.id!==el.dataset.taskDelete);save();renderTasks();}));
  }
  function renderExpenses() {
    const total=data.expenses.reduce((s,e)=>s+e.amount,0);
    $("expenseTotal").textContent=money(total);
    $("expenseCount").textContent=`${data.expenses.length} ${data.expenses.length===1?'entry':'entries'} recorded`;
    $("expenseList").innerHTML=data.expenses.slice(-5).reverse().map(e=>`<div class="list-row"><div class="row-text"><strong>${escapeHTML(e.name)}</strong><small>${escapeHTML(e.date||"Today")}</small></div><strong>${money(e.amount)}</strong><button class="delete-button" data-expense-delete="${e.id}" aria-label="Delete expense">×</button></div>`).join("") || empty("Add an expense to see your total.");
    $("expenseList").querySelectorAll("[data-expense-delete]").forEach(el=>el.addEventListener("click",()=>{data.expenses=data.expenses.filter(x=>x.id!==el.dataset.expenseDelete);save();renderExpenses();}));
  }
  function renderNotes() {
    $("noteList").innerHTML=data.notes.slice(-4).reverse().map(n=>`<div class="list-row"><div class="row-text"><strong>${escapeHTML(n.title||"Quick note")}</strong><small>${escapeHTML(n.text).replace(/\n/g," ")}</small></div><button class="delete-button" data-note-delete="${n.id}" aria-label="Delete note">×</button></div>`).join("") || empty("Save a note, number, link or idea here.");
    $("noteList").querySelectorAll("[data-note-delete]").forEach(el=>el.addEventListener("click",()=>{data.notes=data.notes.filter(x=>x.id!==el.dataset.noteDelete);save();renderNotes();}));
  }
  function renderReminders() {
    data.reminders.sort((a,b)=>a.date.localeCompare(b.date));
    $("reminderList").innerHTML=data.reminders.slice(0,6).map(r=>`<div class="list-row"><div class="row-text"><strong>${escapeHTML(r.title)}</strong><small>${escapeHTML(dateLabel(r.date))}${r.date<todayISO?' · Past date':r.date===todayISO?' · Today':''}</small></div><button class="delete-button" data-reminder-delete="${r.id}" aria-label="Delete reminder">×</button></div>`).join("") || empty("Add a birthday, bill date or appointment.");
    $("reminderList").querySelectorAll("[data-reminder-delete]").forEach(el=>el.addEventListener("click",()=>{data.reminders=data.reminders.filter(x=>x.id!==el.dataset.reminderDelete);save();renderReminders();}));
  }
  function renderShopping() {
    $("shoppingList").innerHTML=data.shopping.map(s=>`<label class="shopping-item ${s.done?'checked':''}"><input type="checkbox" data-shopping-check="${s.id}" ${s.done?'checked':''}><span>${escapeHTML(s.text)}</span><button type="button" class="delete-button" data-shopping-delete="${s.id}" aria-label="Delete item">×</button></label>`).join("") || empty("Your shopping list is empty.");
    $("shoppingList").querySelectorAll("[data-shopping-check]").forEach(el=>el.addEventListener("change",()=>{const s=data.shopping.find(x=>x.id===el.dataset.shoppingCheck);if(s)s.done=el.checked;save();renderShopping();}));
    $("shoppingList").querySelectorAll("[data-shopping-delete]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();data.shopping=data.shopping.filter(x=>x.id!==el.dataset.shoppingDelete);save();renderShopping();}));
  }
  function id(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
  $("todayName").textContent=new Date().toLocaleDateString(undefined,{weekday:"long"});
  $("todayDate").textContent=new Date().toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"});
  $("reminderDate").value=todayISO;
  $("taskForm").addEventListener("submit",e=>{e.preventDefault();const text=$("taskInput").value.trim();if(!text)return;data.tasks.push({id:id(),text,done:false});save();renderTasks();$("taskInput").value="";toast("Task saved.");});
  $("expenseForm").addEventListener("submit",e=>{e.preventDefault();const name=$("expenseName").value.trim();const amount=Number($("expenseAmount").value);if(!name||!Number.isFinite(amount)||amount<=0){toast("Enter an expense name and a positive amount.");return;}data.expenses.push({id:id(),name,amount,date:"Today"});save();renderExpenses();$("expenseName").value="";$("expenseAmount").value="";toast("Expense saved.");});
  $("noteForm").addEventListener("submit",e=>{e.preventDefault();const text=$("noteText").value.trim();if(!text)return;data.notes.push({id:id(),title:$("noteTitle").value.trim(),text});save();renderNotes();$("noteTitle").value="";$("noteText").value="";toast("Note saved on this device.");});
  $("reminderForm").addEventListener("submit",e=>{e.preventDefault();const title=$("reminderTitle").value.trim(),date=$("reminderDate").value;if(!title||!date)return;data.reminders.push({id:id(),title,date});save();renderReminders();$("reminderTitle").value="";$("reminderDate").value=todayISO;toast("Reminder saved.");});
  $("shoppingForm").addEventListener("submit",e=>{e.preventDefault();const text=$("shoppingInput").value.trim();if(!text)return;data.shopping.push({id:id(),text,done:false});save();renderShopping();$("shoppingInput").value="";toast("Added to your list.");});
  $("clearChecked").addEventListener("click",()=>{data.shopping=data.shopping.filter(s=>!s.done);save();renderShopping();toast("Checked items cleared.");});
  document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>{const action=b.dataset.action;const map={"add-task":"taskInput","add-expense":"expenseName","focus-note":"noteText","add-reminder":"reminderTitle"};const target=$(map[action]);if(target){target.focus();target.scrollIntoView({behavior:"smooth",block:"center"});}}));
  $("themeToggle").addEventListener("click",()=>{document.body.classList.toggle("light-mode");const light=document.body.classList.contains("light-mode");$("themeToggle").textContent=light?"☀":"☾";try{localStorage.setItem("ishwarDaily.theme",light?"light":"dark")}catch{}});
  try{if(localStorage.getItem("ishwarDaily.theme")==="light"){document.body.classList.add("light-mode");$("themeToggle").textContent="☀"}}catch{}
  $("percentButton").addEventListener("click",()=>{const a=Number($("percentAmount").value),p=Number($("percentRate").value);if($("percentAmount").value===""||$("percentRate").value===""||!Number.isFinite(a)||!Number.isFinite(p)){$("percentResult").textContent="Enter both numbers.";return;}$("percentResult").textContent=`${p}% of ${a} = ${Number((a*p/100).toFixed(4)).toLocaleString("en-IN")}`;});
  const factors={km:1000,m:1,cm:.01,kg:1,g:.001,lb:.45359237,l:1,ml:.001};
  const labels={km:"km",m:"m",cm:"cm",kg:"kg",g:"g",lb:"lb",l:"L",ml:"mL"};
  $("unitButton").addEventListener("click",()=>{const v=Number($("unitValue").value),from=$("unitFrom").value,to=$("unitTo").value;const compatible=([["km","m","cm"],["kg","g","lb"],["l","ml"]].some(group=>group.includes(from)&&group.includes(to)));if($("unitValue").value===""||!Number.isFinite(v)||!compatible){$("unitResult").textContent="Choose compatible units (length, weight or volume).";return;}const result=v*factors[from]/factors[to];$("unitResult").textContent=`${v} ${labels[from]} = ${Number(result.toPrecision(7)).toLocaleString("en-IN")} ${labels[to]}`;});
  $("discountButton").addEventListener("click",()=>{const price=Number($("priceInput").value),d=Number($("discountInput").value);if($("priceInput").value===""||$("discountInput").value===""||price<0||d<0||d>100){$("discountResult").textContent="Enter a price and discount from 0 to 100%.";return;}const saving=price*d/100;$("discountResult").textContent=`Pay ${money(price-saving)} · Save ${money(saving)}`;});
  $("fuelButton").addEventListener("click",()=>{const distance=Number($("tripDistance").value),mileage=Number($("vehicleMileage").value),price=Number($("fuelPrice").value);if($("tripDistance").value===""||$("vehicleMileage").value===""||$("fuelPrice").value===""||distance<0||mileage<=0||price<0){$("fuelResult").textContent="Enter valid distance, mileage and fuel price.";return;}const litres=distance/mileage;$("fuelResult").textContent=`Approx. ${litres.toFixed(2)} L · Estimated cost ${money(litres*price)}`;});
  $("exportButton").addEventListener("click",()=>{const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),...data},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="daily-my-data.json";a.click();URL.revokeObjectURL(url);toast("Your data export has started.");});
  function renderAll(){renderTasks();renderExpenses();renderNotes();renderReminders();renderShopping();}
  renderAll();
})();