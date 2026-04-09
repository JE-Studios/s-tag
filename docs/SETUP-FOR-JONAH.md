# Oppsett for Jonah

Denne guiden setter opp alt du trenger for å jobbe med S-TAG via Claude Code.

## Forutsetninger

- Mac (nyere enn 2020 anbefalt)
- Internett
- GitHub-konto (JonahSlette)
- Claude-abonnement (Pro $20/mnd eller Max $100/mnd)

## Steg 1 — Installer verktøy

Åpne Terminal (Cmd+Space → skriv "Terminal" → Enter).

Kopier og lim inn denne linjen, trykk Enter:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Vent til den er ferdig (kan ta noen minutter). Følg instruksjonene den viser om å legge brew i PATH.

Deretter:

```bash
brew install git node
```

## Steg 2 — Installer Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

## Steg 3 — Klon prosjektet

```bash
cd ~
git clone https://github.com/JE-Studios/s-tag.git
cd s-tag
```

Hvis GitHub spør om innlogging: kjør `gh auth login` (installer gh med `brew install gh` først).

## Steg 4 — Sett opp git-identitet

```bash
git config user.name "JonahSlette"
git config user.email "din-epost@her.no"
```

## Steg 5 — Start Claude Code

```bash
cd ~/s-tag
claude
```

Claude Code åpner seg. Lim inn meldingen Eliah ga deg, og Claude ordner resten.

## Arbeidsflyt (hver gang du vil endre noe)

1. Åpne Terminal
2. `cd ~/s-tag`
3. `claude`
4. Beskriv hva du vil gjøre på norsk
5. Claude lager koden, committer, og lager en PR
6. Eliah får varsel, reviewer, og merger

Du kan IKKE merge din egen PR — det er med vilje. Eliah godkjenner alt.
