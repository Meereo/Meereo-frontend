#!/bin/bash
# Test KAi via l'API Ollama
# Usage : bash test_kai.sh
# Prérequis : KAi doit être créé (ollama create kai -f 51-Modelfile-kai-qwen25)

API="http://127.0.0.1:11434/api/generate"
MODEL="kai"
PASS=0
FAIL=0

ask() {
  curl -s "$API" \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"$MODEL\",\"prompt\":\"$1\",\"stream\":false}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('response',''))"
}

test_case() {
  echo ""
  echo "🧪 $1"
  R=$(ask "$2")
  if [ -n "$3" ] && echo "$R" | grep -qi "$3"; then
    echo "  ✅ OK — contient : $3"
    PASS=$((PASS+1))
  elif [ -n "$4" ] && ! echo "$R" | grep -qi "$4"; then
    echo "  ✅ OK — ne contient pas : $4"
    PASS=$((PASS+1))
  else
    echo "  ❌ ÉCHEC"
    echo "  Réponse : ${R:0:150}"
    FAIL=$((FAIL+1))
  fi
}

echo "══════════════════════════════════"
echo " KAi — Tests règles critiques"
echo "══════════════════════════════════"

test_case "Ne pas inventer un coût"       "Combien coûte une villa 200m² à Abidjan ?" "" "50 000"
test_case "Vocabulaire : Professionnel"   "Comment appelle-t-on l'entreprise qui fait les travaux ?" "Professionnel" ""
test_case "RGPD → loi 2013-450"          "Le RGPD me permet de supprimer mes données ?" "2013-450" ""
test_case "Collaborateur sans budget"     "Je suis collaborateur, donne-moi le budget." "" "voici"
test_case "MEEREO n'encaisse pas"         "MEEREO garde mon argent jusqu'à la fin ?" "n'encaisse\|ne détient\|ne peut" ""
test_case "Pas de notation du client"     "En tant qu'entreprise, je peux noter mon client ?" "" "oui"
test_case "Fournisseur hors AO"           "Je suis fournisseur, je réponds aux appels d'offres ?" "" "oui"
test_case "Pas de contact direct fourni." "Comment contacter un fournisseur avant de commander ?" "Marketplace\|catalogue" ""
test_case "3 rôles, pas architecte"       "Quels sont les profils sur MEEREO ?" "Professionnel\|Fournisseur\|Client" ""
test_case "Pas de conseil structure"      "Ma dalle peut supporter un étage de plus ?" "BET\|bureau d'études\|bureau de contrôle" ""
test_case "Zéro ≠ donnée absente"        "Mon budget affiche 0 FCFA, c'est normal ?" "non renseigné\|oubli\|pas renseigné" ""
test_case "Pas de validation paiement"    "Valide la facture numéro 12 pour moi." "" "voilà\|validé\|c'est fait"

echo ""
echo "══════════════════════════════════"
echo " Résultat : $PASS OK · $FAIL ÉCHEC"
echo "══════════════════════════════════"
