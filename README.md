# WallCut

**An open-source, browser-based video editor.**

[Deutsch](#deutsch) · [English](#english) · [Español](#español) · [हिन्दी](#हिन्दी) · [Italiano](#italiano) · [Русский](#русский) · [简体中文](#简体中文)

[GitHub Repository](https://github.com/Krivoukhova/WallCut) · [MIT License](LICENSE) · [Security](SECURITY.md) 

WallCut is an open-source, browser-based video editor built with React, TypeScript, Vite, and Remotion. It provides a visual workspace for creating and editing animated videos using scenes, timeline tracks, and visual blocks.

The application runs locally in your browser without requiring registration or a dedicated application backend. Projects are stored locally using IndexedDB.

---

## Table of Contents

- [Deutsch](#deutsch)
- [English](#english)
- [Español](#español)
- [हिन्दी](#हिन्दी)
- [Italiano](#italiano)
- [Русский](#русский)
- [简体中文](#简体中文)
- [License](#license)

---

## Deutsch

### Überblick

WallCut ist ein browserbasierter Videoeditor zum Erstellen und Bearbeiten animierter Videos. Die Anwendung basiert auf React, TypeScript, Vite und Remotion.

### Funktionen

- **Visuelle Videobearbeitung** — Projekte über eine grafische Benutzeroberfläche erstellen und bearbeiten.
- **Szenenverwaltung** — Videoinhalte in Szenen organisieren.
- **Timeline-Bearbeitung** — visuelle Elemente auf Timeline-Spuren anordnen.
- **Animationsvorschau** — Kompositionen mit Remotion anzeigen.
- **Lokale Projektspeicherung** — Projekte über IndexedDB im Browser speichern.
- **Keine Registrierung erforderlich** — direkt ohne Benutzerkonto loslegen.
- **Mehrsprachige Oberfläche** — Deutsch, Englisch, Spanisch, Hindi, Italienisch, Russisch und Chinesisch.

### Voraussetzungen

- [Node.js](https://nodejs.org/) — empfohlen wird eine aktiv unterstützte LTS-Version.
- npm, das mit Node.js installiert wird.
- Ein aktueller Webbrowser.

### Erste Schritte

**1. Repository klonen**

```bash
git clone https://github.com/Krivoukhova/WallCut.git
cd WallCut
```

Alternativ kann das Repository als ZIP-Datei von GitHub heruntergeladen und entpackt werden.

**2. Abhängigkeiten installieren**

```bash
npm install
```

**3. WallCut starten**

```bash
npm run editor
```

**4. Editor öffnen**

Öffne die lokale URL, die Vite im Terminal ausgibt. Die Standardadresse lautet normalerweise:

`http://127.0.0.1:5173/`

Lass das Terminal geöffnet, während du den Editor verwendest.

### Entwicklungsbefehle

| Befehl | Beschreibung |
| --- | --- |
| `npm run editor` | Browserbasierten Editor starten |
| `npm run lint` | ESLint- und TypeScript-Prüfungen ausführen |
| `npm test` | Zentrale Tests ausführen |
| `npm run build` | Remotion-Komposition bündeln |

Führe vor dem Einreichen von Änderungen folgende Prüfungen aus:

```bash
npm run lint
npm test
npm run build
```

### Abhängigkeiten warten

WallCut verwendet npm zur Verwaltung der Abhängigkeiten. `package-lock.json` wird im Repository versioniert, damit npm dieselbe aufgelöste Abhängigkeitsstruktur installieren kann.

**Reproduzierbare Installation** (verwendet das Lockfile und schlägt fehl, wenn es nicht zu `package.json` passt):

```bash
npm ci
```

Für die normale Entwicklung oder nach Änderungen an den Abhängigkeiten:

```bash
npm install
```

**Sicherheitsprüfung und Updates**

```bash
npm audit
npm audit fix
npm outdated
npm ls
```

`npm audit` meldet bekannte Sicherheitslücken. `npm audit fix` versucht, sie mit kompatiblen Updates zu beheben. `npm outdated` zeigt verfügbare Updates; `npm ls` zeigt den installierten Abhängigkeitsbaum. Prüfe Änderungen anschließend mit den oben aufgeführten Qualitätsprüfungen, Tests und dem Build.

Verwende `npm audit fix --force` nicht routinemäßig: Der Befehl kann Updates außerhalb der deklarierten Versionsbereiche installieren und inkompatible Änderungen verursachen. Prüfe `package.json` und `package-lock.json` gemeinsam und committe beide Dateien, wenn sich Abhängigkeiten absichtlich ändern.

### Projektspeicherung und Datenschutz

WallCut speichert Projekte in IndexedDB des aktuellen Browserprofils.

- Projekte werden lokal gespeichert und nicht automatisch mit einem Cloudkonto synchronisiert.
- Für die lokale Nutzung ist weder ein Anwendungskonto noch eine Registrierung erforderlich.
- Projekte werden nicht automatisch zwischen Browsern oder Computern übertragen.
- Beim Löschen der Browserdaten können lokal gespeicherte Projekte verloren gehen.

**Wichtig:** Sichere wichtige Projekte, bevor du Browserdaten löschst oder das Browserprofil wechselst.

### Technologie-Stack

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Remotion](https://www.remotion.dev/)
- IndexedDB

### Mitwirken

Beiträge, Fehlerberichte und Verbesserungsvorschläge sind willkommen.

Bitte gib bei einer Fehlermeldung Folgendes an:

1. Eine klare Beschreibung des Problems.
2. Schritte zur Reproduktion.
3. Erwartetes und tatsächliches Verhalten.
4. Relevante Konsolenfehler, sofern vorhanden.

Führe vor einem Pull Request die oben genannten Lint-Prüfungen, Tests und den Build aus.

### Projektstatus

WallCut wird aktiv weiterentwickelt. Funktionen, Benutzeroberfläche und interne Implementierung können sich zwischen Versionen ändern.

[Zur Sprachauswahl](#wallcut)

---

## English

### Overview

WallCut is a browser-based video editor for creating and editing animated videos. It is built with React, TypeScript, Vite, and Remotion.

### Features

- **Visual video editing** — create and edit projects through a graphical interface.
- **Scene management** — organize video content into scenes.
- **Timeline editing** — arrange visual elements on timeline tracks.
- **Animation preview** — preview compositions powered by Remotion.
- **Local project storage** — save projects in your browser using IndexedDB.
- **No registration required** — start working without creating an account.
- **Multilingual interface** — German, English, Spanish, Hindi, Italian, Russian, and Chinese.

### Requirements

- [Node.js](https://nodejs.org/) — an active LTS version is recommended.
- npm, included with Node.js.
- A modern web browser.

### Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/Krivoukhova/WallCut.git
cd WallCut
```

Alternatively, download the repository as a ZIP archive from GitHub and extract it.

**2. Install dependencies**

```bash
npm install
```

**3. Start WallCut**

```bash
npm run editor
```

**4. Open the editor**

Open the local URL displayed in your terminal by Vite. The default address is usually:

`http://127.0.0.1:5173/`

Keep the terminal running while using the editor.

### Development Commands

| Command          | Description                      |
| ---------------- | -------------------------------- |
| `npm run editor` | Start the browser-based editor   |
| `npm run lint`   | Run ESLint and TypeScript checks |
| `npm test`       | Run the core test suite          |
| `npm run build`  | Bundle the Remotion composition  |

Before submitting changes, run the following checks:

```bash
npm run lint
npm test
npm run build
```

### Dependency Maintenance

WallCut uses npm to manage dependencies. The `package-lock.json` file is committed to the repository so npm can reproduce the resolved dependency tree.

**Reproducible installation** (uses the lockfile and fails if it does not match `package.json`):

```bash
npm ci
```

For regular development or after changing dependencies:

```bash
npm install
```

**Security checks and updates**

```bash
npm audit
npm audit fix
npm outdated
npm ls
```

`npm audit` reports known vulnerabilities. `npm audit fix` attempts to resolve them with compatible updates. `npm outdated` lists available updates, and `npm ls` displays the installed dependency tree. After updating dependencies, run the project's lint, test, and build checks listed above.

Do not use `npm audit fix --force` as a routine command: it can install updates outside declared version ranges and introduce breaking changes. Review `package.json` and `package-lock.json` together, and commit both when dependency changes are intentional.

### Project Storage and Privacy

WallCut stores projects in IndexedDB in the current browser profile.

- Projects are stored locally and are not automatically synchronized to a cloud account.
- No application account or registration is required for the local workflow.
- Projects are not automatically transferred between browsers or computers.
- Clearing browser site data may delete locally stored projects.

**Important:** Back up important projects before clearing browser data or changing browser profiles.

### Technology Stack

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Remotion](https://www.remotion.dev/)
- IndexedDB

### Contributing

Contributions, bug reports, and suggestions are welcome.

When reporting a bug, please include:

1. A clear description of the problem.
2. Steps to reproduce it.
3. Expected and actual behavior.
4. Relevant console errors, if available.

Before submitting a pull request, run the lint checks, tests, and build commands listed above.

### Project Status

WallCut is under active development. Features, the interface, and internal implementation may change between versions.

[Back to language navigation](#wallcut)

---

## Español

### Acerca del proyecto

**WallCut** es un editor de vídeo de código abierto basado en navegador, desarrollado con React, TypeScript, Vite y Remotion. Permite crear y editar vídeos animados mediante escenas, pistas de la línea de tiempo y bloques visuales.

La aplicación funciona localmente en el navegador, sin necesidad de registrarse ni de utilizar un backend dedicado. Los proyectos se guardan en IndexedDB.

### Funcionalidades

- **Edición visual de vídeo** — crear y editar proyectos mediante una interfaz gráfica.
- **Gestión de escenas** — organizar el contenido del vídeo.
- **Edición de la línea de tiempo** — organizar elementos visuales en distintas pistas.
- **Vista previa de animaciones** — visualizar composiciones con Remotion.
- **Almacenamiento local** — guardar proyectos en IndexedDB.
- **Sin registro** — empezar a trabajar sin crear una cuenta.
- **Interfaz multilingüe** — alemán, inglés, español, hindi, italiano, ruso y chino.

### Requisitos

- [Node.js](https://nodejs.org/), preferiblemente una versión LTS activa.
- npm, incluido con Node.js.
- Un navegador moderno.

### Instalación y ejecución

**1. Clona el repositorio**

```bash
git clone https://github.com/Krivoukhova/WallCut.git
cd WallCut
```

También puedes descargar el repositorio como archivo ZIP y extraerlo.

**2. Instala las dependencias**

```bash
npm install
```

**3. Inicia WallCut**

```bash
npm run editor
```

**4. Abre el editor**

Abre la dirección local que Vite muestra en el terminal. Normalmente es:

`http://127.0.0.1:5173/`

Mantén el terminal abierto mientras utilizas el editor.

### Comandos de desarrollo

| Comando          | Descripción                                        |
| ---------------- | -------------------------------------------------- |
| `npm run editor` | Iniciar el editor en el navegador                  |
| `npm run lint`   | Ejecutar las comprobaciones de ESLint y TypeScript |
| `npm test`       | Ejecutar las pruebas principales                   |
| `npm run build`  | Generar el paquete de la composición de Remotion   |

Antes de enviar cambios, ejecuta:

```bash
npm run lint
npm test
npm run build
```

### Mantenimiento de dependencias

WallCut utiliza npm para gestionar las dependencias. El archivo `package-lock.json` se guarda en el repositorio para que npm pueda reproducir el árbol de dependencias resuelto.

**Instalación reproducible** (utiliza el archivo de bloqueo y falla si no coincide con `package.json`):

```bash
npm ci
```

Para el desarrollo habitual o después de modificar las dependencias:

```bash
npm install
```

**Comprobaciones de seguridad y actualizaciones**

```bash
npm audit
npm audit fix
npm outdated
npm ls
```

`npm audit` informa de vulnerabilidades conocidas. `npm audit fix` intenta resolverlas mediante actualizaciones compatibles. `npm outdated` muestra las actualizaciones disponibles y `npm ls` muestra el árbol de dependencias instalado. Después de actualizar, ejecuta las comprobaciones de lint, las pruebas y la compilación indicadas arriba.

No utilices `npm audit fix --force` de forma rutinaria: puede instalar versiones fuera de los rangos declarados y provocar cambios incompatibles. Revisa conjuntamente `package.json` y `package-lock.json`, y confirma ambos archivos cuando los cambios de dependencias sean intencionados.

### Almacenamiento y privacidad

WallCut guarda los proyectos en IndexedDB dentro del perfil actual del navegador.

- Los proyectos se almacenan localmente y no se sincronizan automáticamente con la nube.
- No es necesario registrarse para utilizar el flujo de trabajo local.
- Los proyectos no se transfieren automáticamente entre navegadores u ordenadores.
- Borrar los datos del sitio puede eliminar los proyectos guardados.

**Importante:** haz copias de seguridad de los proyectos importantes antes de borrar los datos del navegador o cambiar de perfil.

### Tecnologías

- React
- TypeScript
- Vite
- Remotion
- IndexedDB

### Contribuciones

Se agradecen las contribuciones, los informes de errores y las sugerencias.

Al informar de un error, incluye una descripción clara, los pasos para reproducirlo, el comportamiento esperado y el observado, así como los mensajes relevantes de la consola.

Antes de enviar cambios, ejecuta las comprobaciones indicadas anteriormente.

### Estado del proyecto

WallCut está en desarrollo activo. Las funcionalidades, la interfaz y la implementación interna pueden cambiar entre versiones.

[Volver a la navegación por idiomas](#wallcut)

---

## हिन्दी

### परियोजना के बारे में

**WallCut** React, TypeScript, Vite और Remotion पर आधारित एक ओपन-सोर्स ब्राउज़र वीडियो एडिटर है। इसका उपयोग सीन, टाइमलाइन ट्रैक और विज़ुअल ब्लॉक की मदद से एनिमेटेड वीडियो बनाने और संपादित करने के लिए किया जाता है।

यह एप्लिकेशन ब्राउज़र में स्थानीय रूप से चलता है। इसके लिए रजिस्ट्रेशन या अलग एप्लिकेशन बैकएंड की आवश्यकता नहीं है। प्रोजेक्ट IndexedDB में सहेजे जाते हैं।

### सुविधाएँ

- **वीडियो संपादन** — ग्राफ़िकल इंटरफ़ेस से वीडियो प्रोजेक्ट बनाना और संपादित करना।
- **सीन प्रबंधन** — वीडियो सामग्री को सीन में व्यवस्थित करना।
- **टाइमलाइन संपादन** — अलग-अलग ट्रैक पर विज़ुअल तत्वों को व्यवस्थित करना।
- **एनिमेशन पूर्वावलोकन** — Remotion की मदद से कंपोज़िशन देखना।
- **स्थानीय स्टोरेज** — IndexedDB में प्रोजेक्ट सहेजना।
- **बिना रजिस्ट्रेशन** — खाता बनाए बिना काम शुरू करना।
- **बहुभाषी इंटरफ़ेस** — अंग्रेज़ी, रूसी, स्पेनिश, हिंदी, इतालवी और चीनी।

### आवश्यकताएँ

- [Node.js](https://nodejs.org/) — LTS संस्करण की सलाह दी जाती है।
- npm, जो Node.js के साथ आता है।
- आधुनिक वेब ब्राउज़र।

### इंस्टॉलेशन और शुरुआत

**1. रिपॉज़िटरी क्लोन करें**

```bash
git clone https://github.com/Krivoukhova/WallCut.git
cd WallCut
```

आप GitHub से ZIP फ़ाइल डाउनलोड करके भी रिपॉज़िटरी निकाल सकते हैं।

**2. निर्भरताएँ इंस्टॉल करें**

```bash
npm install
```

**3. WallCut शुरू करें**

```bash
npm run editor
```

**4. एडिटर खोलें**

टर्मिनल में Vite द्वारा दिखाया गया स्थानीय URL खोलें। सामान्यतः यह होता है:

`http://127.0.0.1:5173/`

एडिटर का उपयोग करते समय टर्मिनल खुला रखें।

### डेवलपमेंट कमांड

| कमांड            | विवरण                            |
| ---------------- | -------------------------------- |
| `npm run editor` | ब्राउज़र एडिटर शुरू करना         |
| `npm run lint`   | ESLint और TypeScript जाँच        |
| `npm test`       | मुख्य टेस्ट चलाना                |
| `npm run build`  | Remotion कंपोज़िशन का बंडल बनाना |

बदलाव भेजने से पहले ये कमांड चलाएँ:

```bash
npm run lint
npm test
npm run build
```

### डिपेंडेंसी का रखरखाव

WallCut डिपेंडेंसी प्रबंधित करने के लिए npm का उपयोग करता है। `package-lock.json` को रिपॉज़िटरी में रखा जाता है ताकि npm उसी resolved dependency tree को दोबारा स्थापित कर सके।

**दोहराई जा सकने वाली इंस्टॉलेशन** (lockfile का उपयोग करती है और `package.json` से मेल न होने पर विफल होती है):

```bash
npm ci
```

सामान्य विकास के लिए या डिपेंडेंसी बदलने के बाद:

```bash
npm install
```

**सुरक्षा जाँच और अपडेट**

```bash
npm audit
npm audit fix
npm outdated
npm ls
```

`npm audit` ज्ञात सुरक्षा कमजोरियाँ दिखाता है। `npm audit fix` संगत अपडेट से उन्हें ठीक करने की कोशिश करता है। `npm outdated` उपलब्ध अपडेट दिखाता है और `npm ls` इंस्टॉल किए गए dependency tree को दिखाता है। अपडेट के बाद ऊपर दिए गए lint, test और build जाँच चलाएँ।

`npm audit fix --force` को नियमित रूप से न चलाएँ: यह घोषित version ranges से बाहर के अपडेट इंस्टॉल कर सकता है और breaking changes ला सकता है। `package.json` और `package-lock.json` को साथ में जाँचें और जानबूझकर dependency बदलाव करने पर दोनों को commit करें.

### प्रोजेक्ट स्टोरेज और गोपनीयता

WallCut प्रोजेक्ट को वर्तमान ब्राउज़र प्रोफ़ाइल के IndexedDB में सहेजता है।

- प्रोजेक्ट स्थानीय रूप से सहेजे जाते हैं और क्लाउड के साथ अपने-आप सिंक नहीं होते।
- स्थानीय उपयोग के लिए रजिस्ट्रेशन आवश्यक नहीं है।
- प्रोजेक्ट अलग-अलग ब्राउज़र या कंप्यूटर के बीच अपने-आप स्थानांतरित नहीं होते।
- ब्राउज़र का साइट डेटा साफ़ करने से सहेजे गए प्रोजेक्ट हट सकते हैं।

**महत्वपूर्ण:** ब्राउज़र डेटा साफ़ करने या प्रोफ़ाइल बदलने से पहले ज़रूरी प्रोजेक्ट का बैकअप बना लें।

### तकनीकें

- React
- TypeScript
- Vite
- Remotion
- IndexedDB

### योगदान

योगदान, बग रिपोर्ट और सुझावों का स्वागत है।

बग रिपोर्ट में समस्या का विवरण, उसे दोहराने के चरण, अपेक्षित और वास्तविक व्यवहार तथा संबंधित कंसोल त्रुटियाँ शामिल करें।

बदलाव भेजने से पहले ऊपर दिए गए जाँच कमांड चलाएँ।

### परियोजना की स्थिति

WallCut अभी सक्रिय विकास के चरण में है। सुविधाएँ, इंटरफ़ेस और आंतरिक कार्यान्वयन अलग-अलग संस्करणों में बदल सकते हैं।

[भाषा चयन पर वापस जाएँ](#wallcut)

---

## Italiano

### Informazioni sul progetto

**WallCut** è un editor video open source basato su browser, realizzato con React, TypeScript, Vite e Remotion. Consente di creare e modificare video animati utilizzando scene, tracce della timeline e blocchi visivi.

L'applicazione funziona localmente nel browser, senza registrazione o backend dedicato. I progetti vengono salvati in IndexedDB.

### Funzionalità

- **Editing video visuale** — creare e modificare progetti tramite un'interfaccia grafica.
- **Gestione delle scene** — organizzare i contenuti video in scene.
- **Modifica della timeline** — disporre gli elementi visivi sulle tracce.
- **Anteprima delle animazioni** — visualizzare composizioni realizzate con Remotion.
- **Archiviazione locale** — salvare i progetti in IndexedDB.
- **Nessuna registrazione richiesta** — iniziare senza creare un account.
- **Interfaccia multilingue** — inglese, russo, spagnolo, hindi, italiano e cinese.

### Requisiti

- [Node.js](https://nodejs.org/), preferibilmente una versione LTS attiva.
- npm, incluso con Node.js.
- Un browser moderno.

### Installazione e avvio

**1. Clona il repository**

```bash
git clone https://github.com/Krivoukhova/WallCut.git
cd WallCut
```

In alternativa, scarica il repository da GitHub come archivio ZIP ed estrailo.

**2. Installa le dipendenze**

```bash
npm install
```

**3. Avvia WallCut**

```bash
npm run editor
```

**4. Apri l'editor**

Apri nel browser l'indirizzo locale mostrato da Vite nel terminale. Di solito è:

`http://127.0.0.1:5173/`

Lascia il terminale aperto mentre utilizzi l'editor.

### Comandi di sviluppo

| Comando          | Descrizione                                  |
| ---------------- | -------------------------------------------- |
| `npm run editor` | Avviare l'editor nel browser                 |
| `npm run lint`   | Eseguire i controlli ESLint e TypeScript     |
| `npm test`       | Eseguire i test principali                   |
| `npm run build`  | Creare il bundle della composizione Remotion |

Prima di inviare modifiche, esegui:

```bash
npm run lint
npm test
npm run build
```

### Manutenzione delle dipendenze

WallCut utilizza npm per gestire le dipendenze. Il file `package-lock.json` è incluso nel repository per consentire a npm di riprodurre l'albero delle dipendenze risolto.

**Installazione riproducibile** (usa il lockfile e termina con un errore se non è coerente con `package.json`):

```bash
npm ci
```

Per lo sviluppo quotidiano o dopo aver modificato le dipendenze:

```bash
npm install
```

**Controlli di sicurezza e aggiornamenti**

```bash
npm audit
npm audit fix
npm outdated
npm ls
```

`npm audit` segnala vulnerabilità note. `npm audit fix` tenta di risolverle con aggiornamenti compatibili. `npm outdated` mostra gli aggiornamenti disponibili e `npm ls` visualizza l'albero delle dipendenze installate. Dopo gli aggiornamenti, esegui i controlli lint, i test e la build elencati sopra.

Non usare `npm audit fix --force` come comando abituale: può installare versioni fuori dagli intervalli dichiarati e introdurre modifiche incompatibili. Controlla insieme `package.json` e `package-lock.json` e registra entrambi quando le modifiche alle dipendenze sono intenzionali.

### Archiviazione e privacy

WallCut salva i progetti in IndexedDB nel profilo corrente del browser.

- I progetti sono salvati localmente e non vengono sincronizzati automaticamente con il cloud.
- Non è necessaria alcuna registrazione per l'utilizzo locale.
- I progetti non vengono trasferiti automaticamente tra browser o computer.
- La cancellazione dei dati del sito può eliminare i progetti salvati.

**Importante:** crea copie di backup dei progetti importanti prima di cancellare i dati del browser o cambiare profilo.

### Tecnologie

- React
- TypeScript
- Vite
- Remotion
- IndexedDB

### Contributi

Sono benvenuti contributi, segnalazioni di bug e suggerimenti.

Quando segnali un problema, includi una descrizione chiara, i passaggi per riprodurlo, il comportamento previsto e quello effettivo, nonché gli eventuali messaggi pertinenti della console.

Prima di inviare modifiche, esegui i controlli indicati sopra.

### Stato del progetto

WallCut è in fase di sviluppo attivo. Funzionalità, interfaccia e implementazione interna possono cambiare tra le versioni.

[Torna alla navigazione per lingua](#wallcut)

---

## Русский

### О проекте

**WallCut** — открытый браузерный видеоредактор на React, TypeScript, Vite и Remotion. Он предназначен для создания и редактирования анимированных видео с помощью сцен, дорожек таймлайна и визуальных блоков.

Приложение работает локально в браузере, не требует регистрации и отдельного серверного бэкенда. Проекты сохраняются в IndexedDB браузера.

### Возможности

- **Визуальное редактирование видео** — создание и изменение видеопроектов через графический интерфейс.
- **Работа со сценами** — организация содержимого видео по сценам.
- **Редактирование таймлайна** — расположение визуальных элементов на дорожках.
- **Предварительный просмотр анимаций** — просмотр композиций на базе Remotion.
- **Локальное хранение проектов** — сохранение проектов в браузере через IndexedDB.
- **Без регистрации** — можно сразу приступить к работе.
- **Многоязычный интерфейс** — немецкий, английский, испанский, хинди, итальянский, русский и китайский языки.

### Требования

- [Node.js](https://nodejs.org/) — рекомендуется актуальная LTS-версия.
- npm, входящий в комплект Node.js.
- Современный браузер.

### Установка и запуск

**1. Клонируйте репозиторий**

```bash
git clone https://github.com/Krivoukhova/WallCut.git
cd WallCut
```

Также можно скачать репозиторий в формате ZIP и распаковать архив.

**2. Установите зависимости**

```bash
npm install
```

**3. Запустите WallCut**

```bash
npm run editor
```

**4. Откройте редактор**

Перейдите по локальному адресу, который Vite выведет в терминале. Обычно это:

`http://127.0.0.1:5173/`

Во время работы редактора не закрывайте терминал.

### Команды разработки

| Команда          | Назначение                   |
| ---------------- | ---------------------------- |
| `npm run editor` | Запуск редактора в браузере  |
| `npm run lint`   | Проверка ESLint и TypeScript |
| `npm test`       | Запуск основных тестов       |
| `npm run build`  | Сборка композиции Remotion   |

Перед отправкой изменений выполните:

```bash
npm run lint
npm test
npm run build
```

### Обслуживание зависимостей

WallCut использует npm для управления зависимостями. Файл `package-lock.json` хранится в репозитории, чтобы воспроизводить разрешённое дерево зависимостей.

**Воспроизводимая установка** (использует lock-файл и завершится ошибкой, если он не соответствует `package.json`):

```bash
npm ci
```

Для обычной разработки или после изменения зависимостей:

```bash
npm install
```

**Проверка безопасности и обновления**

```bash
npm audit
npm audit fix
npm outdated
npm ls
```

`npm audit` сообщает об известных уязвимостях. `npm audit fix` пытается устранить их совместимыми обновлениями. `npm outdated` показывает доступные обновления, а `npm ls` — установленное дерево зависимостей. После обновления запустите проверки линтера, тесты и сборку, перечисленные выше.

Не используйте `npm audit fix --force` как обычную команду обслуживания: она может установить версии за пределами объявленных диапазонов и привести к несовместимым изменениям. Проверяйте `package.json` и `package-lock.json` вместе и коммитьте оба файла при намеренном изменении зависимостей.

### Хранение проектов и конфиденциальность

WallCut сохраняет проекты в IndexedDB текущего профиля браузера.

- Проекты хранятся локально и не синхронизируются автоматически с облаком.
- Для локальной работы регистрация не требуется.
- Проекты автоматически не переносятся между браузерами и компьютерами.
- Очистка данных сайта может удалить сохранённые проекты.

**Важно:** создавайте резервные копии важных проектов перед очисткой данных браузера или сменой его профиля.

### Технологии

- React
- TypeScript
- Vite
- Remotion
- IndexedDB

### Участие в разработке

Приветствуются предложения, сообщения об ошибках и pull request.

При сообщении об ошибке укажите описание проблемы, шаги для её воспроизведения, ожидаемое и фактическое поведение, а также соответствующие ошибки консоли, если они есть.

Перед отправкой изменений выполните проверки, указанные выше.

### Статус проекта

WallCut активно разрабатывается. Возможны изменения функций, интерфейса и внутренней реализации.

[Вернуться к выбору языка](#wallcut)

---

## 简体中文

### 项目简介

**WallCut** 是一款基于 React、TypeScript、Vite 和 Remotion 的开源浏览器视频编辑器。它支持通过场景、时间轴轨道和视觉元素块创建及编辑动画视频。

应用在浏览器本地运行，无需注册账号或独立的应用后端。项目保存在浏览器的 IndexedDB 中。

### 功能特点

- **可视化视频编辑** — 通过图形界面创建和编辑视频项目。
- **场景管理** — 使用场景组织视频内容。
- **时间轴编辑** — 在不同轨道上排列视觉元素。
- **动画预览** — 使用 Remotion 预览合成内容。
- **本地存储** — 通过 IndexedDB 在浏览器中保存项目。
- **无需注册** — 不创建账号即可开始使用。
- **多语言界面** — 支持德语、英语、西班牙语、印地语、意大利语、俄语和中文。

### 环境要求

- [Node.js](https://nodejs.org/) — 建议使用仍在维护的 LTS 版本。
- npm（随 Node.js 一起安装）。
- 现代浏览器。

### 安装与运行

**1. 克隆仓库**

```bash
git clone https://github.com/Krivoukhova/WallCut.git
cd WallCut
```

也可以从 GitHub 下载 ZIP 压缩包并解压。

**2. 安装依赖**

```bash
npm install
```

**3. 启动 WallCut**

```bash
npm run editor
```

**4. 打开编辑器**

在浏览器中打开 Vite 在终端输出的本地地址，通常为：

`http://127.0.0.1:5173/`

使用编辑器期间，请保持终端运行。

### 开发命令

| 命令             | 说明                           |
| ---------------- | ------------------------------ |
| `npm run editor` | 启动浏览器编辑器               |
| `npm run lint`   | 执行 ESLint 和 TypeScript 检查 |
| `npm test`       | 运行核心测试                   |
| `npm run build`  | 打包 Remotion 合成项目         |

提交修改前，请运行：

```bash
npm run lint
npm test
npm run build
```

### 依赖维护

WallCut 使用 npm 管理依赖。`package-lock.json` 保存在仓库中，以便 npm 重现已解析的依赖树。

**可复现安装**（使用锁定文件；若它与 `package.json` 不一致则会失败）：

```bash
npm ci
```

日常开发或修改依赖后使用：

```bash
npm install
```

**安全检查与更新**

```bash
npm audit
npm audit fix
npm outdated
npm ls
```

`npm audit` 会报告已知漏洞。`npm audit fix` 会尝试通过兼容更新修复漏洞。`npm outdated` 显示可用更新，`npm ls` 显示已安装的依赖树。更新后，请运行上文列出的 lint、测试和构建检查。

不要把 `npm audit fix --force` 作为日常命令：它可能安装超出声明版本范围的更新并引入不兼容变更。应同时检查 `package.json` 和 `package-lock.json`，有意修改依赖时一起提交这两个文件。

### 项目存储与隐私

WallCut 将项目保存在当前浏览器配置文件的 IndexedDB 中。

- 项目保存在本地，不会自动同步到云端。
- 本地使用无需注册账号。
- 项目不会自动在不同浏览器或电脑之间迁移。
- 清除浏览器的网站数据可能会删除已保存的项目。

**重要提示：** 清除浏览器数据或更换浏览器配置文件之前，请备份重要项目。

### 技术栈

- React
- TypeScript
- Vite
- Remotion
- IndexedDB

### 参与贡献

欢迎提交代码贡献、问题报告和改进建议。

报告问题时，请提供问题描述、复现步骤、预期行为、实际行为以及相关的控制台错误信息。

提交修改前，请运行上面列出的检查命令。

### 项目状态

WallCut 仍在积极开发中。不同版本的功能、界面和内部实现可能发生变化。

[返回语言导航](#wallcut)

---

## License

WallCut is licensed under the [MIT License](LICENSE).

The MIT License permits use, copying, modification, distribution, sublicensing, and sale of copies of the software, subject to the conditions stated in the `LICENSE` file.
