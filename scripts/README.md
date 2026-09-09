# Puzzle Generator Agent

Script para gerar novos puzzles do LogicaMente e criar um PR no GitHub automaticamente.

## Uso

```bash
# Requer variável de ambiente GITHUB_TOKEN
export GITHUB_TOKEN="ghp_..."

# Gerar 10 puzzles de sequencia
python3 scripts/puzzle_generator.py --tipo sequencia --quantidade 10

# Gerar 5 puzzles de codigo
python3 scripts/puzzle_generator.py --tipo codigo --quantidade 5

# Gerar ambos os tipos (20 total)
python3 scripts/puzzle_generator.py --tipo todos --quantidade 20

# Preview sem criar PR
python3 scripts/puzzle_generator.py --dry-run
```

## Como funciona

1. Lê o ficheiro `data/puzzles_lp.json` do repo via GitHub API
2. Gera novos puzzles numerados a partir do último ID existente
3. Cria um branch `add-puzzles-YYYY-MM-DD` no GitHub
4. Faz commit do ficheiro atualizado
5. Abre um Pull Request para revisão da Daniela

## Tipos de puzzles gerados

- **sequencia**: ordena 5 itens com pistas lógicas (antes, imediatamente antes, primeiro, etc.)
- **codigo**: decifra um número de 3 dígitos com tentativas numeradas (tipo Mastermind)

## Dependências

Só usa stdlib Python (json, random, re, argparse, urllib, base64, datetime).

