export const config = { runtime: 'edge' };

const API_KEY = "db_HQIwDXV9xkJTEU5F3wwYAGhHAGInsItCu79g5FSz6e3106ee";
const BASE_URL = "https://mateoacademy-9djnmu.jelou.cloud/api/collections/pronosticos_brackets/records";

const GROUPS_DATA = {
  "A": ["Mexico", "South Korea", "South Africa", "Czech Republic"],
  "B": ["Canada", "Switzerland", "Qatar", "Bosnia and Herzegovina"],
  "C": ["Brazil", "Morocco", "Haiti", "Scotland"],
  "D": ["USA", "Australia", "Paraguay", "Turkey"],
  "E": ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
  "F": ["Netherlands", "Japan", "Sweden", "Tunisia"],
  "G": ["Belgium", "Egypt", "Iran", "New Zealand"],
  "H": ["Spain", "Uruguay", "Saudi Arabia", "Cape Verde"],
  "I": ["France", "Senegal", "Norway", "Iraq"],
  "J": ["Argentina", "Algeria", "Austria", "Jordan"],
  "K": ["Portugal", "Colombia", "Uzbekistan", "DR Congo"],
  "L": ["England", "Croatia", "Ghana", "Panama"]
};

const FLAGS = {
  "MEXICO":"🇲🇽","SOUTH KOREA":"🇰🇷","SOUTH AFRICA":"🇿🇦","CZECH REPUBLIC":"🇨🇿","CANADA":"🇨🇦","SWITZERLAND":"🇨🇭","QATAR":"🇶🇦","BOSNIA AND HERZEGOVINA":"🇧🇦",
  "BRAZIL":"🇧🇷","MOROCCO":"🇲🇦","HAITI":"🇭🇹","SCOTLAND":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","USA":"🇺🇸","AUSTRALIA":"🇦🇺","PARAGUAY":"🇵🇾","TURKEY":"🇹🇷","GERMANY":"🇩🇪","CURAÇAO":"🇨🇼",
  "IVORY COAST":"🇨🇮","ECUADOR":"🇪🇨","NETHERLANDS":"🇳🇱","JAPAN":"🇯🇵","SWEDEN":"🇸🇪","TUNISIA":"🇹🇳","BELGIUM":"🇧🇪","EGYPT":"🇪🇬","IRAN":"🇮🇷","NEW ZEALAND":"🇳🇿",
  "SPAIN":"🇪🇸","URUGUAY":"🇺🇾","SAUDI ARABIA":"🇸🇦","CAPE VERDE":"🇨🇻","FRANCE":"🇫🇷","SENEGAL":"🇸🇳","NORWAY":"🇳🇴","IRAQ":"🇮🇶","ARGENTINA":"🇦🇷","ALGERIA":"🇩🇿",
  "AUSTRIA":"🇦🇹","JORDAN":"🇯🇴","PORTUGAL":"🇵🇹","COLOMBIA":"🇨🇴","UZBEKISTAN":"🇺🇿","DR CONGO":"🇨🇩","ENGLAND":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","CROATIA":"🇭🇷","GHANA":"🇬🇭","PANAMA":"🇵🇦"
};

export default async function handler(req) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id') || 'GUEST';
  const executionId = url.searchParams.get('executionId') || '';

  if (req.method === 'POST') {
    try {
      const data = await req.json();
      const existReq = await fetch(`${BASE_URL}?filter=(user_id='${userId}')`, { headers: { 'X-Api-Key': API_KEY } });
      const existData = await existReq.json();
      const existingId = existData.items && existData.items[0] ? existData.items[0].id : null;
      const method = existingId ? 'PATCH' : 'POST';
      const fetchUrl = existingId ? `${BASE_URL}/${existingId}` : BASE_URL;
      await fetch(fetchUrl, {
        method,
        headers: { 'X-Api-Key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...data })
      });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  let saved = {};
  try {
    const res = await fetch(`${BASE_URL}?filter=(user_id='${userId}')`, { headers: { 'X-Api-Key': API_KEY } });
    const d = await res.json();
    if (d.items && d.items[0]) saved = d.items[0];
  } catch(e) {}

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
    <title>Quiniela Mundial 2026</title>
    <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root{--black:#000;--white:#fff;--lime:#C9FF24;--mag:#FF0055;--teal:#00FFCC;--dim:#121212;--bd:rgba(255,255,255,.1)}
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        body{background:var(--black);color:var(--white);font-family:Inter,sans-serif;padding-bottom:120px;overflow-x:hidden}
        .app{max-width:450px;margin:auto;padding:0 16px}
        
        .header{margin:30px 0 20px;border-bottom:4px solid var(--white);padding-bottom:12px}
        .logo-text{font-family:'Archivo Black';font-size:36px;line-height:.8;letter-spacing:-2px;text-transform:uppercase;color:var(--white)}
        .sub-text{font-family:'Archivo Black';font-size:24px;line-height:.9;margin-top:8px;color:var(--lime);text-transform:uppercase}
        
        .tabs{display:flex;overflow-x:auto;gap:8px;margin-bottom:20px;padding-bottom:8px;scrollbar-width:none}
        .tabs::-webkit-scrollbar{display:none}
        .tab{padding:8px 16px;background:var(--dim);border:2px solid var(--bd);font-family:'Archivo Black';font-size:11px;white-space:nowrap;cursor:pointer;transition:.2s;text-transform:uppercase}
        .tab.active{background:var(--white);color:var(--black);border-color:var(--white)}
        
        .panel{display:none;min-height:300px}
        .panel.active{display:block;animation:fadeIn .4s ease-out forwards}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        
        .instr{font-size:10px;font-weight:900;text-transform:uppercase;color:var(--teal);letter-spacing:1px;margin-bottom:16px;display:flex;justify-content:space-between;border-left:3px solid var(--teal);padding-left:8px}
        
        /* Groups View */
        .group-card{background:var(--dim);border:2px solid var(--bd);margin-bottom:20px;position:relative}
        .group-head{background:var(--white);color:var(--black);padding:6px 12px;font-family:'Archivo Black';font-size:14px;display:inline-block;margin-bottom:8px}
        .team-row{display:flex;align-items:center;padding:12px;border-bottom:1px solid var(--bd);gap:12px}
        .team-row:last-child{border-bottom:none}
        .t-flag{font-size:24px}
        .t-name{flex:1;font-weight:900;font-size:14px;text-transform:uppercase;font-family:Inter,sans-serif}
        .t-btns{display:flex;gap:6px}
        .t-btn{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid var(--bd);background:rgba(255,255,255,.05);color:rgba(255,255,255,.4);font-size:10px;font-weight:900;cursor:pointer;transition:.15s}
        .t-btn.sel{background:var(--lime);color:var(--black);border-color:var(--lime);box-shadow:0 0 15px rgba(201,255,36,.3)}
        .t-btn.sel-3{background:var(--mag);color:var(--white);border-color:var(--mag);box-shadow:0 0 15px rgba(255,0,85,.3)}
        
        /* Match Card */
        .match-card{background:var(--dim);border:2px solid var(--bd);margin-bottom:16px;position:relative}
        .match-info{font-size:10px;font-weight:900;color:var(--white);padding:6px 12px;text-transform:uppercase;background:rgba(255,255,255,.05);display:flex;justify-content:space-between}
        .match-teams{display:flex;flex-direction:column}
        .m-team{display:flex;align-items:center;padding:14px;gap:14px;cursor:pointer;transition:.2s;position:relative}
        .m-team:first-child{border-bottom:1px solid var(--bd)}
        .m-team.winner{background:rgba(201,255,36,.1)}
        .m-team.winner::after{content:'🏆';position:absolute;right:15px;font-size:14px}
        .m-team.winner .t-name{color:var(--lime)}
        
        .footer{position:fixed;bottom:0;left:0;width:100%;padding:20px;background:var(--black);border-top:4px solid var(--lime);z-index:100;display:flex;flex-direction:column;gap:10px}
        .btn-save{background:var(--lime);color:var(--black);padding:18px;border:none;font-family:'Archivo Black';font-size:18px;cursor:pointer;display:none;text-transform:uppercase;letter-spacing:1px}
        .btn-save.visible{display:block;animation:pulse 2s infinite}
        @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(201,255,36,0.4)}70%{box-shadow:0 0 0 20px rgba(201,255,36,0)}100%{box-shadow:0 0 0 0 rgba(201,255,36,0)}}
        .btn-back{background:var(--white);color:var(--black);padding:12px;border:none;font-family:'Archivo Black';font-size:14px;cursor:pointer;text-transform:uppercase}
        
        .toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:var(--white);color:var(--black);padding:14px 28px;font-family:'Archivo Black';z-index:200;display:none;box-shadow:0 10px 30px rgba(0,0,0,.5)}
    </style>
</head>
<body>
    <div class="toast" id="toast">PRONÓSTICOS GUARDADOS</div>
    <div class="app">
        <div class="header">
            <h1 class="logo-text">JELOU<br>MUNDIAL 2026</h1>
            <h2 class="sub-text">MIS<br>CLASIFICADOS</h2>
        </div>
        <div class="tabs" id="tabs">
            <div class="tab active" onclick="setTab(0)">GRUPOS</div>
            <div class="tab" onclick="setTab(1)">32vos</div>
            <div class="tab" onclick="setTab(2)">16vos</div>
            <div class="tab" onclick="setTab(3)">4tos</div>
            <div class="tab" onclick="setTab(4)">SEMIS</div>
            <div class="tab" onclick="setTab(5)">FINALES</div>
        </div>
        <div id="panel0" class="panel active"></div>
        <div id="panel1" class="panel"></div>
        <div id="panel2" class="panel"></div>
        <div id="panel3" class="panel"></div>
        <div id="panel4" class="panel"></div>
        <div id="panel5" class="panel"></div>
    </div>
    <div class="footer">
        <button class="btn-save" id="btnSave" onclick="save()">GUARDAR PRONOSTICOS</button>
        <button class="btn-back" onclick="back()">VOLVER AL MENU</button>
    </div>

    <script>
        const GROUPS = ${JSON.stringify(GROUPS_DATA)};
        const FLAGS = ${JSON.stringify(FLAGS)};
        const SAVED = ${JSON.stringify(saved)};
        
        function setTab(idx){
            document.querySelectorAll('.tab').forEach((t,i)=>t.classList.toggle('active',i===idx));
            document.querySelectorAll('.panel').forEach((p,i)=>p.classList.toggle('active',i===idx));
            renderPanel(idx);
        }

        const MATCH_CFG = [
          {id:73, s1:{g:'A', p:2}, s2:{g:'B', p:2}},
          {id:74, s1:{g:'E', p:1}, s2:{pool:['A','B','C','D','F']}},
          {id:75, s1:{g:'F', p:1}, s2:{g:'C', p:2}},
          {id:76, s1:{g:'C', p:1}, s2:{g:'F', p:2}},
          {id:77, s1:{g:'I', p:1}, s2:{pool:['C','D','F','G','H']}},
          {id:78, s1:{g:'E', p:2}, s2:{g:'I', p:2}},
          {id:79, s1:{g:'A', p:1}, s2:{pool:['C','E','F','H','I']}},
          {id:80, s1:{g:'L', p:1}, s2:{pool:['E','H','I','J','K']}},
          {id:81, s1:{g:'D', p:1}, s2:{pool:['B','E','F','I','J']}},
          {id:82, s1:{g:'G', p:1}, s2:{pool:['A','E','H','I','J']}},
          {id:83, s1:{g:'K', p:2}, s2:{g:'L', p:2}},
          {id:84, s1:{g:'H', p:1}, s2:{g:'J', p:2}},
          {id:85, s1:{g:'B', p:1}, s2:{pool:['E','F','G','I','J']}},
          {id:86, s1:{g:'J', p:1}, s2:{g:'H', p:2}},
          {id:87, s1:{g:'K', p:1}, s2:{pool:['D','E','I','J','L']}},
          {id:88, s1:{g:'D', p:2}, s2:{g:'G', p:2}}
        ];

        const BRACKET_MAP = {
            89:[74,77],90:[73,75],91:[78,79],92:[80,81],93:[82,83],94:[84,85],95:[86,87],96:[88,76],
            97:[89,90],98:[91,92],99:[93,94],100:[95,96],101:[97,98],102:[99,100], "FINAL":[101,102], "3ER":[101,102]
        };

        let state = {
            gpg: SAVED.gpg || {},
            winners: SAVED.winners || {},
            campeon: SAVED.campeon || null, sub: SAVED.subcampeon || null,
            tercero: SAVED.tercer_lugar || null, cuarto: SAVED.cuarto_lugar || null
        };

        function renderPanel(idx){
            try {
                const p = document.getElementById('panel'+idx); p.innerHTML='';
                if(idx===0) renderGroups(p);
                else if(idx===1) renderR32(p);
                else if(idx===2) renderBracket(p,[89,90,91,92,93,94,95,96],"OCTAVOS (R16)");
                else if(idx===3) renderBracket(p,[97,98,99,100],"CUARTOS (QF)");
                else if(idx===4) renderBracket(p,[101,102],"SEMIFINALES (SF)");
                else if(idx===5) renderFinals(p);
                checkSaveButton();
            } catch(err) {
                console.error(err);
            }
        }

        function renderGroups(el){
            let thCount=0;
            Object.keys(GROUPS).forEach(gid=>{ if(state.gpg[gid] && state.gpg[gid]['3']) thCount++; });
            
            let h = '<div class="instr"><span>ELIGE 1, 2 Y 3 POR GRUPO</span> <span>COMPLETADOS: '+thCount+'/8 MEJORES 3ROS</span></div>';
            Object.keys(GROUPS).forEach(gid=>{
                h += '<div class="group-card"><div class="group-head">GRUPO '+gid+'</div>';
                GROUPS[gid].forEach(t=>{
                    const sel = state.gpg[gid]||{};
                    const is1=sel['1']===t, is2=sel['2']===t, is3=sel['3']===t;
                    h += '<div class="team-row"><span class="t-flag">'+(FLAGS[t.toUpperCase()]||'🏳️')+'</span><span class="t-name">'+t+'</span><div class="t-btns">'+
                        '<button class="t-btn '+(is1?'sel':'')+'" onclick="toggleG(\''+gid+'\',\''+t+'\',\'1\')">1°</button>'+
                        '<button class="t-btn '+(is2?'sel':'')+'" onclick="toggleG(\''+gid+'\',\''+t+'\',\'2\')">2°</button>'+
                        '<button class="t-btn '+(is3?'sel-3':'')+'" onclick="toggleG(\''+gid+'\',\''+t+'\',\'3\')"'+(!is3&&thCount>=8?' disabled':'')+'>3°</button>'+
                    '</div></div>';
                });
                h += '</div>';
            });
            el.innerHTML = h;
        }

        function toggleG(gid, t, p){
            if(!state.gpg[gid]) state.gpg[gid]={1:null,2:null,3:null};
            const cur = state.gpg[gid][p];
            Object.keys(state.gpg[gid]).forEach(k=>{if(state.gpg[gid][k]===t)state.gpg[gid][k]=null;});
            state.gpg[gid][p] = (cur===t)?null:t;
            // No reset total winners, only dependents
            state.winners={}; 
            renderPanel(0);
        }

        function getTeam(side){
            if(!side) return null;
            if(side.pool){
                const busy=[]; 
                for(const m of MATCH_CFG){
                    if(m.id === side.matchId) break; 
                    const b = checkPool(m.s2.pool, busy); if(b) busy.push(b);
                }
                const found = checkPool(side.pool, busy);
                return found || null;
            }
            return (state.gpg[side.group]||{})[side.pos] || null;
        }

        function checkPool(pool, busy){
            if(!pool)return null;
            for(const gid of pool){
                const t=(state.gpg[gid]||{})['3'];
                if(t && !busy.includes(t))return t;
            }
            return null;
        }

        function renderR32(el){
            let h='<div class="instr">DIECISEISAVOS DE FINAL (R32)</div>';
            MATCH_CFG.forEach(m=> {
                m.s2.matchId = m.id; // Para la lógica de busy
                h+=renderMatch(m.id, getTeam(m.s1), getTeam(m.s2));
            });
            el.innerHTML=h;
        }

        function renderBracket(el, ids, title){
            let h='<div class="instr">'+title+'</div>';
            ids.forEach(id=> h+=renderMatch(id, state.winners[BRACKET_MAP[id][0]], state.winners[BRACKET_MAP[id][1]]));
            el.innerHTML=h;
        }

        function renderMatch(id, t1, t2){
            const win = state.winners[id];
            const isValid1 = t1 && t1 !== 'null' && t1 !== 'undefined';
            const isValid2 = t2 && t2 !== 'null' && t2 !== 'undefined';
            
            const ui = (t, valid) => '<div class="m-team '+(win===t&&valid?'winner':'')+'" onclick="pick(\''+id+'\',\''+t+'\')">'+
                '<span class="t-flag">'+(valid?(FLAGS[t.toUpperCase()]||'🏳️'):'⚪')+'</span>'+
                '<span class="t-name">'+(valid?t:'POR DEFINIR')+'</span></div>';
            
            return '<div class="match-card"><div class="match-info"><span>PARTIDO '+id+'</span></div> <div class="match-teams">'+ui(t1, isValid1)+ui(t2, isValid2)+'</div></div>';
        }

        function pick(id, t){
            if(!t || t==='null' || t==='undefined' || t==='POR DEFINIR') return;
            state.winners[id]=t;
            Object.keys(BRACKET_MAP).forEach(k=>{ 
                if(BRACKET_MAP[k].includes(parseInt(id)) || BRACKET_MAP[k].includes(id)) {
                    if(state.winners[k] !== t && state.winners[k] !== null) {
                         // Solo limpiar si el ganador ya no es posible
                    }
                }
            });
            const idx = Array.from(document.querySelectorAll('.tab')).findIndex(t=>t.classList.contains('active'));
            renderPanel(idx);
        }

        function renderFinals(el){
            const t1=state.winners[101], t2=state.winners[102];
            const l1=getL(101), l2=getL(102);
            el.innerHTML = '<div class="instr">FINALES</div>'+renderMatch("FINAL",t1,t2)+'<div style="margin-top:20px">'+renderMatch("3ER",l1,l2)+'</div>';
            if(state.winners["FINAL"]){ state.campeon=state.winners["FINAL"]; state.sub=(state.winners["FINAL"]===t1)?t2:t1; }
            if(state.winners["3ER"]){ state.tercero=state.winners["3ER"]; state.cuarto=(state.winners["3ER"]===l1)?l2:l1; }
        }

        function getL(id){
            const w=state.winners[id]; if(!w)return null;
            const s=BRACKET_MAP[id]; const t1=state.winners[s[0]], t2=state.winners[s[1]];
            return (w===t1)?t2:t1;
        }

        function checkSaveButton(){
            const ok = !!state.winners["FINAL"] && !!state.winners["3ER"];
            document.getElementById('btnSave').classList.toggle('visible', ok);
        }

        function back(){
            const exId=new URLSearchParams(window.location.search).get("executionId")||"${executionId}";
            fetch("https://workflows.jelou.ai/v1/webview/callback", {
                method:"POST", headers:{"Content-Type":"application/json"},
                body: JSON.stringify({executionId:exId, success:true, data:{action:"volver"}})
            }).finally(()=> window.location.href="https://wa.me/13239183195");
        }

        function save(){
            const btn=document.getElementById('btnSave'); btn.innerText="GUARDANDO...";
            const payload = {
                dieciseisavos:[73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88].map(id=>state.winners[id]),
                octavos:[89,90,91,92,93,94,95,96].map(id=>state.winners[id]),
                cuartos:[97,98,99,100].map(id=>state.winners[id]),
                semis:[101,102].map(id=>state.winners[id]),
                campeon:state.campeon, subcampeon:state.sub, tercer_lugar:state.tercero, cuarto_lugar:state.cuarto, gpg:state.gpg
            };
            fetch(window.location.href, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)})
            .then(r=>r.ok? (document.getElementById('toast').style.display='block', setTimeout(back,1500)) : alert("Error"));
        }
        renderPanel(0);
    </script>
</body>
</html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
