
# Dependabot Quick Reference

## 🎯 Waar vind je Dependabot PRs?

### GitHub Web Interface
1. **Ga naar:** https://github.com/ancproggrams/trust/pulls
2. **Filter:** `is:pr is:open author:app/dependabot`
3. **Of klik:** Author dropdown → `app/dependabot`

### GitHub CLI (Terminal)
```bash
# Authenticeer eerst
gh auth login

# Bekijk alle open Dependabot PRs
gh pr list --search "is:pr is:open author:app/dependabot"

# Bekijk details van een PR
gh pr view [PR_NUMBER]
```

## 🤖 Automatische Goedkeuring Status

| Update Type | Auto-Approve | Auto-Merge | Manual Review |
|-------------|--------------|------------|---------------|
| Security    | ✅ Yes       | ✅ Yes     | ❌ No         |
| Patch (x.x.X) | ✅ Yes    | ✅ Yes     | ❌ No         |
| Minor (x.X.x) | ✅ Yes    | ✅ Yes     | ❌ No         |
| Major (X.x.x) | ❌ No     | ❌ No      | ✅ Yes        |

## 🚀 Quick Actions

### Handmatig goedkeuren (voor major updates)
```bash
gh pr review [PR_NUMBER] --approve --body "Reviewed and approved"
gh pr merge [PR_NUMBER] --squash --delete-branch
```

### Emergency rollback
```bash
git revert [MERGE_COMMIT_SHA] -m 1
git push origin main
```

## 📍 Repository Settings Check

Zorg ervoor dat deze instellingen correct zijn:
- **Settings → General → Pull Requests:** "Allow auto-merge" ✅
- **Settings → Branches → main:** Branch protection rules actief ✅
- **Security → Dependabot:** Alerts enabled ✅

## 🔔 Waar krijg je notificaties?

1. **GitHub Notifications:** Bell icon rechtsboven
2. **Email:** Als je repository "watched"
3. **Issues:** Auto-created bij problemen
4. **Actions Tab:** Workflow status

## ❓ Problemen?

- **PR wordt niet auto-approved?** Check of het een major update is
- **Auto-merge werkt niet?** Controleer branch protection rules
- **Workflow faalt?** Bekijk Actions tab voor details
- **Rollback nodig?** Er wordt automatisch een issue aangemaakt

**Voor hulp:** Maak een issue aan met label `dependabot-support`
