import React, { createContext, useContext, useEffect, useState } from 'react'

type Language = 'system' | 'en' | 'fr'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  currentLanguage: 'en' | 'fr'
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation dictionaries
const translations = {
  en: {
    // Auth & Login
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.enterEmail': 'Enter your email',
    'auth.enterPassword': 'Enter your password',
    'auth.createPassword': 'Create a password',
    'auth.confirmPasswordPlaceholder': 'Confirm your password',
    'auth.fullNamePlaceholder': 'Enter your full name',
    'auth.createAccount': 'Create Account',
    'auth.welcome': 'Welcome',
    'auth.welcomeDescription': 'Sign in to your account or create a new one',
    'auth.termsText': 'By signing in, you agree to our terms of service and privacy policy.',
    'auth.loading': 'Loading...',
    
    // Common
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',
    'common.personal': 'Personal',
    'common.shared': 'Shared',
    'common.user': 'User',
    'common.addUser': 'Add User',
    'common.addPeople': 'Add People',
    'common.searchByNameOrEmail': 'Search by name or email...',
    'common.peopleWithAccess': 'People with access',
    'common.inProgress': 'In progress',
    'common.generate': 'Generate',
    'common.poweredByAI': 'Powered by AI + Vector Search',
    'common.complete': 'Complete',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.taskings': 'Taskings',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.signOut': 'Sign Out',
    'nav.newTasking': 'New Tasking',
    
    // Dashboard
    'dashboard.title': 'SSC Tasking',
    'dashboard.subtitle': 'Generate AI-powered briefing notes',
    'dashboard.welcomeTitle': 'Welcome to SSC Tasking',
    'dashboard.analyticsOverview': 'Analytics Overview',
    'dashboard.overview': 'Overview',
    'dashboard.yourTaskings': 'Your Taskings',
    'dashboard.newTasking': 'New Tasking',
    'dashboard.totalTaskings': 'Total Taskings',
    'dashboard.totalFiles': 'Total Files',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.totalBriefings': 'Total Briefings',
    'dashboard.noTaskings': 'No taskings found',
    'dashboard.createFirst': 'Create your first tasking to get started',
    'dashboard.activeWorkstreams': 'Active workstreams',
    'dashboard.documentsUploaded': 'Documents uploaded',
    'dashboard.newThisWeek': 'New this week',
    'dashboard.generated': 'Generated',
    
    // Tasking
    'tasking.title': 'Tasking',
    'tasking.description': 'Description',
    'tasking.files': 'Files',
    'tasking.briefings': 'Briefings',
    'tasking.chat': 'Chat',
    'tasking.users': 'Users',
    'tasking.share': 'Share',
    'tasking.generateBriefing': 'Generate Briefing',
    'tasking.uploadFiles': 'Upload Files',
    'tasking.uploadedFiles': 'Uploaded Files',
    'tasking.dragDrop': 'Drag and drop files here, or click to select',
    'tasking.supportedFormats': 'Supported formats: PDF, DOC, DOCX, TXT',
    'tasking.maxFileSize': 'Maximum file size: 10MB',
    'tasking.noFiles': 'No files uploaded yet',
    'tasking.noBriefings': 'No briefings generated yet',
    'tasking.generateFirst': 'Generate your first briefing from the uploaded files',
    'tasking.chatPlaceholder': 'Ask questions about your documents...',
    'tasking.chatPlaceholderDefault': 'Ask me anything about your documents',
    'tasking.typeYourMessage': 'Type your message',
    'tasking.send': 'Send',
    'tasking.usersCount': 'Users({count})',
    'tasking.shareTaskingTitle': 'Share "{title}"',
    'tasking.shareDescription': 'Add people to collaborate on this tasking. You can remove access at any time.',
    'tasking.updated': 'Updated {time}',
    
    // File Management
    'files.upload': 'Upload',
    'files.uploading': 'Uploading...',
    'files.uploaded': 'Uploaded',
    'files.failed': 'Upload failed',
    'files.size': 'Size',
    'files.type': 'Type',
    'files.lastModified': 'Last Modified',
    'files.download': 'Download',
    'files.remove': 'Remove',
    'files.count': '{count} files',
    'files.singleFile': '1 file',
    'files.fileCount': '{count} Files',
    'files.fileCountSingle': '1 File',
    'files.filesLabel': 'files',
    'files.fileLabel': 'file',
    
    // Briefings
    'briefing.title': 'Briefing',
    'briefing.generatedOn': 'Generated on',
    'briefing.generating': 'Generating briefing...',
    'briefing.failed': 'Failed to generate briefing',
    'briefing.retry': 'Retry',
    'briefing.export': 'Export',
    'briefing.markdown': 'Markdown',
    'briefing.pdf': 'PDF',
    'briefing.briefingTitle': 'Briefing Title',
    'briefing.briefingTitlePlaceholder': 'Enter a briefing title',
    'briefing.briefingTitleExample': 'e.g., AI Initiative Performance Summary, Data Platform ROI Analysis, Automation Program Status Update...',
    'briefing.briefingRequirements': 'Briefing Requirements',
    'briefing.briefingRequirementsPlaceholder': 'Describe what you want in your briefing. Focus on performance metrics, efficiency analysis, governance issues, or strategic recommendations needed for leadership review...',
    'briefing.sampleBriefingTypes': 'Sample Briefing Types',
    'briefing.sampleExecutiveSummary': 'Generate an executive summary briefing analyzing project performance, key deliverables, timeline adherence, and resource efficiency from the uploaded project documents',
    'briefing.sampleGovernanceRisk': 'Create a governance and risk assessment briefing identifying compliance gaps, security concerns, and mitigation strategies based on the project documentation',
    'briefing.sampleStrategicPerformance': 'Produce a strategic performance briefing evaluating project ROI, cost-benefit analysis, and operational impact using data from the uploaded files',
    'briefing.sampleLeadershipBriefing': 'Generate a leadership briefing on project status, critical issues, resource needs, and strategic recommendations derived from the project materials',
    'briefing.sampleExecutiveDashboard': 'Create an executive dashboard briefing summarizing project KPIs, budget status, milestone progress, and actionable insights from the uploaded documentation',
    'briefing.briefingCount': '{count} briefings',
    'briefing.briefingCountSingle': '1 briefing',
    'briefing.briefingsLabel': 'briefings',
    'briefing.briefingLabel': 'briefing',
    
    // Chat
    'chat.title': 'Chat',
    'chat.chatCount': '{count} chats',
    'chat.chatCountSingle': '1 chat',
    'chat.chatsLabel': 'chats',
    'chat.chatLabel': 'chat',
    
    // Modals
    'modal.createTasking': 'Create New Tasking',
    'modal.createTaskingDescription': 'Set up a new tasking to organize your work and generate AI-powered briefing notes.',
    'modal.taskingTitle': 'Tasking Title',
    'modal.taskingTitlePlaceholder': 'Enter a title for your tasking',
    'modal.taskingDescription': 'Description (Optional)',
    'modal.taskingDescriptionPlaceholder': 'Describe what this tasking is about',
    'modal.create': 'Create Tasking',
    'modal.taskingCreated': 'Tasking created',
    'modal.taskingCreatedDescription': 'Your tasking has been created successfully.',
    'modal.taskingCreationFailed': 'Failed to create tasking. Please try again.',
    'modal.shareTasking': 'Share Tasking',
    'modal.shareWith': 'Share with users',
    'modal.searchUsers': 'Search users by email...',
    'modal.permissions': 'Permissions',
    'modal.canView': 'Can view',
    'modal.canEdit': 'Can edit',
    'modal.sharedWith': 'Shared with',
    'modal.removeAccess': 'Remove access',
    
    // User Profile
    'profile.profile': 'Profile',
    'profile.account': 'Account',
    'profile.preferences': 'Preferences',
    'profile.theme': 'Theme',
    'profile.language': 'Language',
    'profile.system': 'System',
    'profile.light': 'Light',
    'profile.dark': 'Dark',
    'profile.english': 'English',
    'profile.french': 'Français',
    
    // Time and Dates
    'time.justNow': 'Just now',
    'time.minuteAgo': '1 minute ago',
    'time.minutesAgo': '{count} minutes ago',
    'time.hourAgo': '1 hour ago',
    'time.hoursAgo': '{count} hours ago',
    'time.dayAgo': '1 day ago',
    'time.daysAgo': '{count} days ago',
    'time.weekAgo': '1 week ago',
    'time.weeksAgo': '{count} weeks ago',
    'time.monthAgo': '1 month ago',
    'time.monthsAgo': '{count} months ago',
    'time.yearAgo': '1 year ago',
    'time.yearsAgo': '{count} years ago',
    'time.updated': 'Updated {time}',
    'time.created': 'Created {time}',
    'time.ago22h': '22h ago',
    'time.ago23h': '23h ago',
    'time.ago1d': '1 day ago',
    'time.ago23hours': '23 hours ago',
    
    // Error Messages
    'error.generic': 'An unexpected error occurred',
    'error.network': 'Network error. Please check your connection.',
    'error.unauthorized': 'You are not authorized to perform this action',
    'error.notFound': 'The requested resource was not found',
    'error.validation': 'Please check your input and try again',
  },
  fr: {
    // Auth & Login
    'auth.signin': 'Se connecter',
    'auth.signup': "S'inscrire",
    'auth.email': 'E-mail',
    'auth.password': 'Mot de passe',
    'auth.confirmPassword': 'Confirmer le mot de passe',
    'auth.fullName': 'Nom complet',
    'auth.enterEmail': 'Entrez votre e-mail',
    'auth.enterPassword': 'Entrez votre mot de passe',
    'auth.createPassword': 'Créez un mot de passe',
    'auth.confirmPasswordPlaceholder': 'Confirmez votre mot de passe',
    'auth.fullNamePlaceholder': 'Entrez votre nom complet',
    'auth.createAccount': 'Créer un compte',
    'auth.welcome': 'Bienvenue',
    'auth.welcomeDescription': 'Connectez-vous à votre compte ou créez-en un nouveau',
    'auth.termsText': 'En vous connectant, vous acceptez nos conditions de service et notre politique de confidentialité.',
    'auth.loading': 'Chargement...',
    
    // Common
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.close': 'Fermer',
    'common.open': 'Ouvrir',
    'common.search': 'Rechercher',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.warning': 'Avertissement',
    'common.info': 'Information',
    'common.personal': 'Personnel',
    'common.shared': 'Partagé',
    'common.user': 'Utilisateur',
    'common.addUser': 'Ajouter un utilisateur',
    'common.addPeople': 'Ajouter des personnes',
    'common.searchByNameOrEmail': 'Rechercher par nom ou e-mail...',
    'common.peopleWithAccess': 'Personnes ayant accès',
    'common.inProgress': 'En cours',
    'common.generate': 'Générer',
    'common.poweredByAI': 'Alimenté par IA + Recherche vectorielle',
    'common.complete': 'Terminé',
    
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.taskings': 'Tâches',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    'nav.signOut': 'Se déconnecter',
    'nav.newTasking': 'Nouvelle tâche',
    
    // Dashboard
    'dashboard.title': 'SSC Tasking',
    'dashboard.subtitle': 'Générez des notes de briefing alimentées par IA',
    'dashboard.welcomeTitle': 'Bienvenue dans SSC Tasking',
    'dashboard.analyticsOverview': "Vue d'ensemble des analyses",
    'dashboard.overview': "Vue d'ensemble",
    'dashboard.yourTaskings': 'Vos tâches',
    'dashboard.newTasking': 'Nouvelle tâche',
    'dashboard.totalTaskings': 'Total des tâches',
    'dashboard.totalFiles': 'Total des fichiers',
    'dashboard.recentActivity': 'Activité récente',
    'dashboard.totalBriefings': 'Total des briefings',
    'dashboard.noTaskings': 'Aucune tâche trouvée',
    'dashboard.createFirst': 'Créez votre première tâche pour commencer',
    'dashboard.activeWorkstreams': 'Flux de travail actifs',
    'dashboard.documentsUploaded': 'Documents téléchargés',
    'dashboard.newThisWeek': 'Nouveau cette semaine',
    'dashboard.generated': 'Générés',
    
    // Tasking
    'tasking.title': 'Tâche',
    'tasking.description': 'Description',
    'tasking.files': 'Fichiers',
    'tasking.briefings': 'Briefings',
    'tasking.chat': 'Chat',
    'tasking.users': 'Utilisateurs',
    'tasking.share': 'Partager',
    'tasking.generateBriefing': 'Générer un briefing',
    'tasking.uploadFiles': 'Télécharger des fichiers',
    'tasking.uploadedFiles': 'Fichiers téléchargés',
    'tasking.dragDrop': 'Glissez-déposez les fichiers ici, ou cliquez pour sélectionner',
    'tasking.supportedFormats': 'Formats supportés : PDF, DOC, DOCX, TXT',
    'tasking.maxFileSize': 'Taille maximale du fichier : 10 Mo',
    'tasking.noFiles': 'Aucun fichier téléchargé encore',
    'tasking.noBriefings': 'Aucun briefing généré encore',
    'tasking.generateFirst': 'Générez votre premier briefing à partir des fichiers téléchargés',
    'tasking.chatPlaceholder': 'Posez des questions sur vos documents...',
    'tasking.chatPlaceholderDefault': 'Demandez-moi tout sur vos documents',
    'tasking.typeYourMessage': 'Tapez votre message',
    'tasking.send': 'Envoyer',
    'tasking.usersCount': 'Utilisateurs({count})',
    'tasking.shareTaskingTitle': 'Partager "{title}"',
    'tasking.shareDescription': 'Ajoutez des personnes pour collaborer sur cette tâche. Vous pouvez supprimer l\'accès à tout moment.',
    'tasking.updated': 'Mis à jour {time}',
    
    // File Management
    'files.upload': 'Télécharger',
    'files.uploading': 'Téléchargement...',
    'files.uploaded': 'Téléchargé',
    'files.failed': 'Échec du téléchargement',
    'files.size': 'Taille',
    'files.type': 'Type',
    'files.lastModified': 'Dernière modification',
    'files.download': 'Télécharger',
    'files.remove': 'Supprimer',
    'files.count': '{count} fichiers',
    'files.singleFile': '1 fichier',
    'files.fileCount': '{count} Fichiers',
    'files.fileCountSingle': '1 Fichier',
    'files.filesLabel': 'fichiers',
    'files.fileLabel': 'fichier',
    
    // Briefings
    'briefing.title': 'Briefing',
    'briefing.generatedOn': 'Généré le',
    'briefing.generating': 'Génération du briefing...',
    'briefing.failed': 'Échec de la génération du briefing',
    'briefing.retry': 'Réessayer',
    'briefing.export': 'Exporter',
    'briefing.markdown': 'Markdown',
    'briefing.pdf': 'PDF',
    'briefing.briefingTitle': 'Titre du briefing',
    'briefing.briefingTitlePlaceholder': 'Entrez un titre de briefing',
    'briefing.briefingTitleExample': 'ex., Résumé de performance Initiative IA, Analyse ROI Plateforme de données, Mise à jour Statut Programme d\'automatisation...',
    'briefing.briefingRequirements': 'Exigences du briefing',
    'briefing.briefingRequirementsPlaceholder': 'Décrivez ce que vous voulez dans votre briefing. Concentrez-vous sur les métriques de performance, l\'analyse d\'efficacité, les enjeux de gouvernance, ou les recommandations stratégiques nécessaires pour l\'examen de la direction...',
    'briefing.sampleBriefingTypes': 'Types d\'exemples de briefing',
    'briefing.sampleExecutiveSummary': 'Générer un résumé exécutif analysant la performance du projet, les livrables clés, le respect des délais et l\'efficacité des ressources à partir des documents de projet téléchargés',
    'briefing.sampleGovernanceRisk': 'Créer un briefing d\'évaluation de gouvernance et des risques identifiant les lacunes de conformité, les préoccupations de sécurité et les stratégies d\'atténuation basées sur la documentation du projet',
    'briefing.sampleStrategicPerformance': 'Produire un briefing de performance stratégique évaluant le ROI du projet, l\'analyse coût-bénéfice et l\'impact opérationnel en utilisant les données des fichiers téléchargés',
    'briefing.sampleLeadershipBriefing': 'Générer un briefing de direction sur le statut du projet, les enjeux critiques, les besoins en ressources et les recommandations stratégiques dérivées des matériaux du projet',
    'briefing.sampleExecutiveDashboard': 'Créer un briefing de tableau de bord exécutif résumant les KPI du projet, le statut budgétaire, le progrès des jalons et les insights actionnables de la documentation téléchargée',
    'briefing.briefingCount': '{count} briefings',
    'briefing.briefingCountSingle': '1 briefing',
    'briefing.briefingsLabel': 'briefings',
    'briefing.briefingLabel': 'briefing',
    
    // Chat
    'chat.title': 'Chat',
    'chat.chatCount': '{count} chats',
    'chat.chatCountSingle': '1 chat',
    'chat.chatsLabel': 'chats',
    'chat.chatLabel': 'chat',
    
    // Modals
    'modal.createTasking': 'Créer une nouvelle tâche',
    'modal.createTaskingDescription': 'Configurez une nouvelle tâche pour organiser votre travail et générer des notes de briefing alimentées par IA.',
    'modal.taskingTitle': 'Titre de la tâche',
    'modal.taskingTitlePlaceholder': 'Entrez un titre pour votre tâche',
    'modal.taskingDescription': 'Description (Optionnel)',
    'modal.taskingDescriptionPlaceholder': 'Décrivez de quoi traite cette tâche',
    'modal.create': 'Créer une tâche',
    'modal.taskingCreated': 'Tâche créée',
    'modal.taskingCreatedDescription': 'Votre tâche a été créée avec succès.',
    'modal.taskingCreationFailed': 'Échec de la création de la tâche. Veuillez réessayer.',
    'modal.shareTasking': 'Partager la tâche',
    'modal.shareWith': 'Partager avec les utilisateurs',
    'modal.searchUsers': 'Rechercher des utilisateurs par e-mail...',
    'modal.permissions': 'Permissions',
    'modal.canView': 'Peut voir',
    'modal.canEdit': 'Peut modifier',
    'modal.sharedWith': 'Partagé avec',
    'modal.removeAccess': "Supprimer l'accès",
    
    // User Profile
    'profile.profile': 'Profil',
    'profile.account': 'Compte',
    'profile.preferences': 'Préférences',
    'profile.theme': 'Thème',
    'profile.language': 'Langue',
    'profile.system': 'Système',
    'profile.light': 'Clair',
    'profile.dark': 'Sombre',
    'profile.english': 'English',
    'profile.french': 'Français',
    
    // Time and Dates
    'time.justNow': "À l'instant",
    'time.minuteAgo': 'Il y a 1 minute',
    'time.minutesAgo': 'Il y a {count} minutes',
    'time.hourAgo': 'Il y a 1 heure',
    'time.hoursAgo': 'Il y a {count} heures',
    'time.dayAgo': 'Il y a 1 jour',
    'time.daysAgo': 'Il y a {count} jours',
    'time.weekAgo': 'Il y a 1 semaine',
    'time.weeksAgo': 'Il y a {count} semaines',
    'time.monthAgo': 'Il y a 1 mois',
    'time.monthsAgo': 'Il y a {count} mois',
    'time.yearAgo': 'Il y a 1 an',
    'time.yearsAgo': 'Il y a {count} ans',
    'time.updated': 'Mis à jour {time}',
    'time.created': 'Créé {time}',
    'time.ago22h': 'Il y a 22h',
    'time.ago23h': 'Il y a 23h',
    'time.ago1d': 'Il y a 1 jour',
    'time.ago23hours': 'Il y a 23 heures',
    
    // Error Messages
    'error.generic': 'Une erreur inattendue est survenue',
    'error.network': 'Erreur réseau. Veuillez vérifier votre connexion.',
    'error.unauthorized': "Vous n'êtes pas autorisé à effectuer cette action",
    'error.notFound': "La ressource demandée n'a pas été trouvée",
    'error.validation': 'Veuillez vérifier votre saisie et réessayer',
  }
}

// Get browser language
function getBrowserLanguage(): 'en' | 'fr' {
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('fr')) {
    return 'fr'
  }
  return 'en'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language')
    return (saved as Language) || 'system'
  })

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'fr'>(() => {
    const saved = localStorage.getItem('language')
    if (saved === 'en' || saved === 'fr') {
      return saved
    }
    return getBrowserLanguage()
  })

  useEffect(() => {
    localStorage.setItem('language', language)

    if (language === 'system') {
      const browserLang = getBrowserLanguage()
      setCurrentLanguage(browserLang)
    } else {
      setCurrentLanguage(language as 'en' | 'fr')
    }
  }, [language])

  // Listen for browser language changes when system is selected
  useEffect(() => {
    if (language === 'system') {
      const handleLanguageChange = () => {
        const browserLang = getBrowserLanguage()
        setCurrentLanguage(browserLang)
      }

      window.addEventListener('languagechange', handleLanguageChange)
      return () => window.removeEventListener('languagechange', handleLanguageChange)
    }
  }, [language])

  // Translation function with interpolation support
  const t = (key: string, variables?: Record<string, string | number>) => {
    let translation = translations[currentLanguage][key] || key
    
    // Simple interpolation for variables like {count}
    if (variables) {
      Object.entries(variables).forEach(([varKey, value]) => {
        translation = translation.replace(`{${varKey}}`, String(value))
      })
    }
    
    return translation
  }

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        currentLanguage, 
        t 
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 