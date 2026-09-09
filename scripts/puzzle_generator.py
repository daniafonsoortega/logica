import os
#!/usr/bin/env python3
"""
LogicaMente Puzzle Generator Agent
Gera novos puzzles (sequencia + codigo) e cria um PR no GitHub para revisão.

Uso:
  python3 puzzle_generator_agent.py --tipo sequencia --quantidade 10
  python3 puzzle_generator_agent.py --tipo codigo --quantidade 5
  python3 puzzle_generator_agent.py --tipo todos --quantidade 20
"""

import json, random, re, argparse, urllib.request, base64
from itertools import permutations
from datetime import datetime

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")  # set via env var
REPO = "daniafonsoortega/logica"
PUZZLES_PATH = "data/puzzles_lp.json"

# ─── Sequence puzzle generator ──────────────────────────────────────────────

def check_c(c, sol):
    t = c[0]; a = c[1]
    pos = {item: i for i, item in enumerate(sol)}
    if t == 'before':             return pos[a] < pos[c[2]]
    if t == 'immediately_before': return pos[c[2]] == pos[a] + 1
    if t == 'first':              return pos[a] == 0
    if t == 'last':               return pos[a] == len(sol)-1
    if t == 'not_first':          return pos[a] != 0
    if t == 'not_last':           return pos[a] != len(sol)-1
    if t == 'between':            return min(pos[c[2]], pos[c[3]]) < pos[a] < max(pos[c[2]], pos[c[3]])
    return True

def all_sols(items, constraints):
    return [p for p in permutations(items) if all(check_c(c, p) for c in constraints)]

def c_to_text(c):
    t = c[0]; a = c[1]
    if t == 'first':              return f"{a} foi o primeiro."
    if t == 'last':               return f"{a} foi o último."
    if t == 'not_first':          return f"{a} não foi o primeiro."
    if t == 'not_last':           return f"{a} não foi o último."
    if t == 'before':             return f"{a} ocorreu antes de {c[2]}."
    if t == 'immediately_before': return f"{a} ocorreu imediatamente antes de {c[2]}."
    if t == 'between':            return f"{a} ficou entre {c[2]} e {c[3]}."
    return "?"

def gen_seq_puzzle(items, sol, nivel):
    pos = {item: i for i, item in enumerate(sol)}
    n = len(items)
    cands = []
    for item in items:
        p = pos[item]
        if p == 0:   cands.append(('first', item))
        if p == n-1: cands.append(('last', item))
        cands.append(('not_first', item))
        cands.append(('not_last', item))
        for other in items:
            if other == item: continue
            if pos[item] < pos[other]:
                cands.append(('before', item, other))
            if pos[other] == pos[item]+1:
                cands.append(('immediately_before', item, other))
        if 0 < p < n-1:
            ls = [x for x in items if pos[x] < p]
            rs = [x for x in items if pos[x] > p]
            for l in ls[:2]:
                for r in rs[:2]:
                    cands.append(('between', item, l, r))
    
    indirect = {'before', 'between', 'not_first', 'not_last'}
    pref_indirect = nivel in ('dificil', 'expert')
    
    def score(c):
        base = 0 if (c[0] in indirect) == pref_indirect else 1
        return base + random.random() * 0.5
    
    for _ in range(30):
        random.shuffle(cands)
        ordered = sorted(cands, key=score)
        selected = []
        for c in ordered:
            test = selected + [c]
            s = all_sols(items, test)
            if tuple(sol) in [tuple(x) for x in s]:
                selected = test
                if len(s) == 1:
                    break
        if len(all_sols(items, selected)) == 1:
            # trim
            trimmed = list(selected)
            i = 0
            while i < len(trimmed):
                wo = trimmed[:i] + trimmed[i+1:]
                if wo and len(all_sols(items, wo)) == 1:
                    trimmed = wo
                else:
                    i += 1
            if len(all_sols(items, trimmed)) == 1:
                return trimmed
    return None

# ─── Codigo puzzle generator ────────────────────────────────────────────────

def gen_codigo_puzzle(nivel, seed=None):
    if seed: random.seed(seed)
    
    n_digits = {'facil': 3, 'medio': 4, 'dificil': 4, 'expert': 5}.get(nivel, 4)
    
    # Generate random digit solution
    digits = [random.randint(0, 9) for _ in range(n_digits)]
    sol = ''.join(map(str, digits))
    
    pistas = []
    
    # Strategy: build indirect clues
    if nivel == 'facil':
        # Mix of direct and simple arithmetic
        for i, d in enumerate(digits):
            if random.random() < 0.5:
                ordinals = ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto']
                pistas.append(f"O {ordinals[i]} dígito é {d}.")
            else:
                if i > 0:
                    diff = d - digits[i-1]
                    if diff > 0:
                        pistas.append(f"O {['segundo','terceiro','quarto','quinto'][i-1]} dígito é {diff} a mais que o anterior.")
                    elif diff < 0:
                        pistas.append(f"O {['segundo','terceiro','quarto','quinto'][i-1]} dígito é {-diff} a menos que o anterior.")
                    else:
                        pistas.append(f"O {['segundo','terceiro','quarto','quinto'][i-1]} dígito é igual ao anterior.")
                else:
                    pistas.append(f"O primeiro dígito é {d}.")
        pistas.append(f"A soma de todos os dígitos é {sum(digits)}.")
    
    else:  # medio, dificil, expert — all indirect
        sum_d = sum(digits)
        pistas.append(f"A soma de todos os dígitos é {sum_d}.")
        
        # Arithmetic relationships
        if n_digits >= 2:
            diff = digits[1] - digits[0]
            if diff > 0: pistas.append(f"O segundo dígito é {diff} a mais que o primeiro.")
            elif diff < 0: pistas.append(f"O segundo dígito é {-diff} a menos que o primeiro.")
            else: pistas.append("O segundo dígito é igual ao primeiro.")
        
        if n_digits >= 3:
            pistas.append(f"O terceiro dígito é {'o maior' if digits[2]==max(digits) else 'o menor' if digits[2]==min(digits) else str(digits[2])}.")
        
        if n_digits >= 4:
            prod = digits[2] * digits[3]
            pistas.append(f"O produto do terceiro e do quarto dígito é {prod}.")
        
        if n_digits >= 5:
            pistas.append(f"O quinto dígito é {'par' if digits[4]%2==0 else 'ímpar'} e {'menor' if digits[4]<5 else 'maior ou igual'} que 5.")
        
        # Add sum of pair
        if n_digits >= 2:
            pistas.append(f"A soma do primeiro e do último dígito é {digits[0]+digits[-1]}.")
    
    # Verify uniqueness (simplified: check that clues narrow to solution)
    # For now, we trust the generation logic + add it to the output for manual review
    
    return {
        "tipo": "codigo",
        "nivel": nivel,
        "tema": f"Código Secreto #{random.randint(100, 999)}",
        "intro": "Para decifrar a mensagem, o agente precisa do código correto:",
        "num_digitos": n_digits,
        "tipo_codigo": "numerico",
        "pistas": pistas,
        "solucao": sol,
        "explicacao": f"Código: {sol}. " + " ".join(f"d{i+1}={d}" for i,d in enumerate(digits)) + "."
    }

# ─── GitHub API helpers ─────────────────────────────────────────────────────

GHDR = {"Authorization": f"token {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"}

def gh_get(path):
    url = f"https://api.github.com/repos/{REPO}/{path}"
    req = urllib.request.Request(url, headers=GHDR)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def gh_put(path, payload):
    url = f"https://api.github.com/repos/{REPO}/{path}"
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers=GHDR, method="PUT")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def gh_post(path, payload):
    url = f"https://api.github.com/repos/{REPO}/{path}"
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers=GHDR, method="POST")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def get_default_branch():
    info = gh_get("git/ref/heads/main")
    return info['object']['sha']

def create_branch(branch_name, from_sha):
    gh_post("git/refs", {"ref": f"refs/heads/{branch_name}", "sha": from_sha})

def get_file_sha(path):
    info = gh_get(f"contents/{path}")
    return info['sha'], base64.b64decode(info['content']).decode('utf-8')

def push_file_to_branch(path, content, message, file_sha, branch):
    payload = {
        "message": message,
        "content": base64.b64encode(content.encode()).decode(),
        "sha": file_sha,
        "branch": branch
    }
    return gh_put(f"contents/{path}", payload)

def create_pr(branch, title, body):
    payload = {"title": title, "body": body, "head": branch, "base": "main"}
    return gh_post("pulls", payload)

# ─── Sequence theme database (compact) ──────────────────────────────────────

SEQ_THEMES = {
    'facil': [
        {"tema": "Campeonato de Xadrez Online", "itens": ["Alice", "Bruno", "Clara", "Diego", "Eva"], "verb": "terminou"},
        {"tema": "Corrida de Karting", "itens": ["Kart 1", "Kart 2", "Kart 3", "Kart 4", "Kart 5"], "verb": "chegou"},
        {"tema": "Prova de Ortografia", "itens": ["Turma A", "Turma B", "Turma C", "Turma D", "Turma E"], "verb": "terminou"},
        {"tema": "Chegada dos Autocarros", "itens": ["Bus 10", "Bus 20", "Bus 30", "Bus 40", "Bus 50"], "verb": "chegou"},
        {"tema": "Torneio de Ping-Pong", "itens": ["Félix", "Greta", "Hans", "Irina", "Jasper"], "verb": "eliminou"},
    ],
    'medio': [
        {"tema": "Desenvolvimento de Software", "itens": ["Sprint A", "Sprint B", "Sprint C", "Sprint D", "Sprint E"], "verb": "foi concluído"},
        {"tema": "Expedição à Amazónia", "itens": ["Equipe Norte", "Equipe Sul", "Equipe Leste", "Equipe Oeste", "Equipe Base"], "verb": "chegou"},
        {"tema": "Publicação de Patentes", "itens": ["Patente A", "Patente B", "Patente C", "Patente D", "Patente E"], "verb": "foi registada"},
        {"tema": "Maratona de Programação", "itens": ["Projeto Alfa", "Projeto Beta", "Projeto Gama", "Projeto Delta", "Projeto Épsilon"], "verb": "foi entregue"},
        {"tema": "Conferências Internacionais", "itens": ["Conf. Ciências", "Conf. Artes", "Conf. Tecnologia", "Conf. Medicina", "Conf. Economia"], "verb": "ocorreu"},
    ],
    'dificil': [
        {"tema": "Sequência Geológica", "itens": ["Camada A", "Camada B", "Camada C", "Camada D", "Camada E"], "verb": "foi formada"},
        {"tema": "Evolução de Espécies", "itens": ["Espécie P", "Espécie Q", "Espécie R", "Espécie S", "Espécie T"], "verb": "surgiu"},
        {"tema": "Construção de Arranha-Céus", "itens": ["Torre Alfa", "Torre Beta", "Torre Gama", "Torre Delta", "Torre Épsilon"], "verb": "foi concluída"},
        {"tema": "Colapso de Impérios Antigos", "itens": ["Império I", "Império II", "Império III", "Império IV", "Império V"], "verb": "colapsou"},
        {"tema": "Fases da Terraformação", "itens": ["Fase Alpha", "Fase Bravo", "Fase Charlie", "Fase Delta", "Fase Echo"], "verb": "foi iniciada"},
    ],
    'expert': [
        {"tema": "Descobertas de Pulsares", "itens": ["Pulsar A", "Pulsar B", "Pulsar C", "Pulsar D", "Pulsar E"], "verb": "foi descoberto"},
        {"tema": "Etapas da Síntese de Proteínas", "itens": ["Etapa I", "Etapa II", "Etapa III", "Etapa IV", "Etapa V"], "verb": "ocorreu"},
        {"tema": "Missões de Resgate Espacial", "itens": ["Missão Uno", "Missão Dos", "Missão Tres", "Missão Cuatro", "Missão Cinco"], "verb": "partiu"},
        {"tema": "Formação de Buracos Negros", "itens": ["Buraco A", "Buraco B", "Buraco C", "Buraco D", "Buraco E"], "verb": "foi formado"},
        {"tema": "Quebra de Códigos Históricos", "itens": ["Código I", "Código II", "Código III", "Código IV", "Código V"], "verb": "foi decifrado"},
    ]
}

SOLUTIONS_TMPL = [
    [0,1,2,3,4],[0,2,1,3,4],[0,2,4,1,3],[1,0,2,3,4],[1,2,0,3,4],
    [1,3,0,2,4],[2,0,1,3,4],[2,4,0,1,3],[3,0,4,1,2],[4,0,2,1,3],
    [0,1,3,2,4],[0,3,1,4,2],[1,0,3,2,4],[2,1,0,3,4],[3,1,0,2,4],
    [4,2,0,1,3],[1,4,2,0,3],[3,4,1,0,2],[2,3,4,0,1],[4,3,2,1,0],
]

def generate_new_puzzles(tipo, quantidade, next_id_start):
    """Generate `quantidade` new puzzles of the given type."""
    puzzles = []
    random.seed(datetime.now().microsecond)
    
    if tipo == 'sequencia':
        all_themes = []
        for nivel, themes in SEQ_THEMES.items():
            for t in themes:
                all_themes.append((nivel, t))
        random.shuffle(all_themes)
        
        sol_idx = 0
        for i in range(quantidade):
            if i >= len(all_themes): break
            nivel, td = all_themes[i]
            items = td['itens']
            tmpl = SOLUTIONS_TMPL[sol_idx % len(SOLUTIONS_TMPL)]
            sol_idx += 1
            solution = [items[j] for j in tmpl]
            
            constraints = gen_seq_puzzle(items, solution, nivel)
            if constraints is None:
                print(f"  WARNING: failed to gen unique puzzle for {td['tema']}")
                continue
            
            pistas = [c_to_text(c) for c in constraints]
            puzzle_id = f"LP-{next_id_start + len(puzzles):03d}"
            
            puzzles.append({
                "id": puzzle_id,
                "tipo": "sequencia",
                "nivel": nivel,
                "tema": td['tema'],
                "intro": f"Cinco eventos ocorreram em momentos distintos. Descubra a sequência exata.",
                "itens": items,
                "pistas": pistas,
                "solucao": solution,
                "explicacao": ", ".join(f"{solution[j]} em {j+1}º" for j in range(len(solution))) + "."
            })
    
    elif tipo == 'codigo':
        niveis = ['facil', 'medio', 'dificil', 'expert']
        for i in range(quantidade):
            nivel = niveis[i % len(niveis)]
            puzzle_id = f"LP-{next_id_start + len(puzzles):03d}"
            p = gen_codigo_puzzle(nivel)
            p['id'] = puzzle_id
            puzzles.append(p)
    
    return puzzles

# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='LogicaMente Puzzle Generator')
    parser.add_argument('--tipo', choices=['sequencia', 'codigo', 'todos'], default='sequencia')
    parser.add_argument('--quantidade', type=int, default=5)
    parser.add_argument('--dry-run', action='store_true', help='Only generate, do not push to GitHub')
    args = parser.parse_args()
    
    print(f"\n🤖 LogicaMente Puzzle Generator")
    print(f"   Tipo: {args.tipo} | Quantidade: {args.quantidade}")
    print(f"   Dry-run: {args.dry_run}\n")
    
    # Get current puzzles to determine next ID
    file_sha, current_json = get_file_sha(PUZZLES_PATH)
    current_puzzles = json.loads(current_json)
    
    # Find next available ID
    existing_ids = set(p['id'] for p in current_puzzles)
    lp_numbers = [int(re.search(r'\d+', p['id']).group()) for p in current_puzzles if re.search(r'\d+', p['id'])]
    next_id = max(lp_numbers) + 1 if lp_numbers else 501
    
    print(f"Current puzzles: {len(current_puzzles)}")
    print(f"Next ID: LP-{next_id:03d}\n")
    
    # Generate new puzzles
    all_new = []
    tipos = ['sequencia', 'codigo'] if args.tipo == 'todos' else [args.tipo]
    per_type = args.quantidade // len(tipos)
    
    for t in tipos:
        print(f"Generating {per_type} {t} puzzles...")
        new = generate_new_puzzles(t, per_type, next_id + len(all_new))
        print(f"  Generated: {len(new)}")
        all_new.extend(new)
    
    if not all_new:
        print("No puzzles generated. Exiting.")
        return
    
    print(f"\nTotal new puzzles: {len(all_new)}")
    
    if args.dry_run:
        print("\nDRY RUN — sample output:")
        print(json.dumps(all_new[0], ensure_ascii=False, indent=2))
        with open('/tmp/generated_puzzles_preview.json', 'w') as f:
            json.dump(all_new, f, ensure_ascii=False, indent=2)
        print(f"\nSaved to /tmp/generated_puzzles_preview.json")
        return
    
    # Create branch
    date_str = datetime.now().strftime('%Y%m%d-%H%M')
    branch = f"puzzles/auto-gen-{date_str}"
    print(f"\nCreating branch: {branch}")
    main_sha = get_default_branch()
    create_branch(branch, main_sha)
    
    # Push updated puzzles file
    updated_puzzles = current_puzzles + all_new
    updated_json = json.dumps(updated_puzzles, ensure_ascii=False, indent=2)
    
    commit_msg = f"feat: add {len(all_new)} new puzzles ({', '.join(tipos)})"
    
    # We need the file SHA from the branch
    result = push_file_to_branch(PUZZLES_PATH, updated_json, commit_msg, file_sha, branch)
    print(f"✅ Pushed {len(all_new)} puzzles to branch {branch}")
    
    # Create PR
    pr_body = f"""## 🤖 Novos Puzzles — Geração Automática

**Data**: {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Total novo**: {len(all_new)} puzzles
**Tipos**: {', '.join(tipos)}
**IDs**: LP-{next_id:03d} a LP-{next_id+len(all_new)-1:03d}

### Resumo por tipo:
{chr(10).join(f"- **{t}**: {sum(1 for p in all_new if p['tipo']==t)} puzzles" for t in tipos)}

### Por nível:
{chr(10).join(f"- **{lvl}**: {sum(1 for p in all_new if p['nivel']==lvl)}" for lvl in ['facil','medio','dificil','expert'])}

---
⚠️ **Revisão necessária**: Verifique a qualidade das pistas e unicidade das soluções antes de fazer merge.
"""
    
    pr = create_pr(branch, f"🤖 Auto: {len(all_new)} novos puzzles ({date_str})", pr_body)
    print(f"\n✅ PR criado: {pr['html_url']}")
    print(f"   Título: {pr['title']}")
    print("\nPróximos passos:")
    print("  1. Revisar os puzzles no PR")
    print("  2. Fazer merge se aprovados")
    print("  3. Deploy automático no Vercel")

if __name__ == '__main__':
    main()
