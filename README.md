# SkiTrackerApp

Мобильное Android-приложение на **React Native (TypeScript)** для телеметрии горных лыж в реальном времени (DIY-аналог Carv).

Приложение одновременно подключается по **Bluetooth Low Energy (BLE)** к двум независимым беспроводным датчикам (левая и правая лыжа на базе ESP32 + MPU-6050), принимает углы по трём осям на частоте 25 Гц и в реальном времени отображает 3D-положение лыж, разницу углов закантовки и параллельность ведения.

---

## Возможности

- **Двойное BLE-подключение:** одновременная работа с двумя независимыми датчиками (`SkiTracker_L` и `SkiTracker_R`).
- **3D-визуализация (SVG):** отображение обеих лыж в реальном времени с переключением ракурса (_Вид сзади_ / _Вид сверху_) и цветовой индикацией ошибок.
- **Контроль техники:** расчёт разницы закантовки (Roll) и параллельности (Yaw) с настраиваемыми допусками.
- **Назначение осей на лету:** экран живых данных (`X`, `Y`, `Z`) для привязки нужной оси к закантовке или повороту без перепрошивки ESP32.
- **Сохранение настроек:** допуски, чувствительность, выбранные оси и инверсия сохраняются в памяти телефона (`AsyncStorage`).
- **Управление датчиками:** удалённый сброс нуля и полная калибровка обоих датчиков по BLE.
- **Активный экран:** экран смартфона не гаснет во время работы приложения (`KeepAwake`).

---

## Структура проекта

```text
SkiTrackerApp/
├── App.tsx                         # Главный экран приложения
├── android/                        # Нативный Android-проект (Gradle)
└── src/
    ├── constants/
    │   └── ble.ts                  # BLE UUID, имена устройств, коды команд
    ├── types/
    │   └── ski.ts                  # TypeScript-типы телеметрии и статусов
    ├── utils/
    │   └── packetParser.ts         # Декодер 16-байтных бинарных BLE-пакетов
    ├── services/
    │   └── bleService.ts           # Сканирование, права Android, подключение к L и R
    ├── hooks/
    │   ├── useSettings.ts          # Хранение настроек в AsyncStorage
    │   └── useSkiTracker.ts        # Состояние датчиков и расчёт метрик
    └── components/
        ├── SkiVisualizer.tsx       # 3D-проекция лыж на react-native-svg
        ├── MetricCard.tsx          # Карточки метрик (закантовка / параллельность)
        ├── SettingsPanel.tsx       # Панель лимитов, чувствительности и инверсии
        └── AxisMapperPanel.tsx     # Живой маппинг осей X / Y / Z
```

---

## Совместимость с железом и BLE-протокол

Приложение ожидает два BLE-устройства с общим сервисом и бинарным пакетом длиной **16 байт** (little-endian):

| Параметр                          | Значение                                                             |
| --------------------------------- | -------------------------------------------------------------------- |
| Имена устройств                   | `SkiTracker_L` (левая, ESP32-S3), `SkiTracker_R` (правая, ESP32-CAM) |
| Service UUID                      | `4fafc201-1fb5-459e-8fcc-c5c9c331914b`                               |
| Telemetry Characteristic (Notify) | `beb5483e-36e1-4688-b7f5-ea07361b26a8`                               |
| Command Characteristic (Write)    | `6e400002-b5a3-f393-e0a9-e50e24dcca9e`                               |
| Формат пакета (16 байт)           | `uint32 timestampMs`, `float angleX`, `float angleY`, `float angleZ` |
| Команды (1 байт)                  | `0x01` — сброс нуля, `0x02` — полная калибровка                      |

---

## Требования к окружению

Для сборки Android APK из исходников понадобятся:

- **Git**
- **Node.js** версии **20 LTS** или выше
- **JDK 17** (Eclipse Temurin / Azul Zulu) — _важно: версии ниже 17 или выше 21 часто вызывают ошибки Gradle_
- **Android Studio** (SDK, Platform-Tools, Build-Tools и NDK)

Ниже приведены пошаговые инструкции по настройке с нуля отдельно для **Windows** и **macOS**.

---

## Настройка окружения на Windows (10 / 11)

### 1. Установка базовых инструментов

Установите через официальные установщики (или через `winget` в PowerShell от имени администратора):

```powershell
winget install Git.Git
winget install OpenJS.NodeJS.LTS
winget install EclipseAdoptium.Temurin.17.JDK
winget install Google.AndroidStudio
```

После установки **перезапустите терминал**.

### 2. Настройка Android Studio и SDK

1. Запустите **Android Studio** и пройдите начальный мастер установки (_Standard_ setup).
2. Откройте **More Actions → SDK Manager** (или **Settings → Languages & Frameworks → Android SDK**).
3. На вкладке **SDK Platforms** поставьте галочку **Show Package Details** (внизу справа) и отметьте актуальную платформу (обычно **Android 14 / API 34** или **Android 15 / API 35** — в соответствии с `compileSdkVersion` в `android/build.gradle`):
   - `Android SDK Platform 35` (и/или `34`)
4. На вкладке **SDK Tools** (также с галочкой **Show Package Details**) отметьте:
   - `Android SDK Build-Tools` (версия из `android/build.gradle`)
   - `Android SDK Command-line Tools (latest)`
   - `Android SDK Platform-Tools`
   - `NDK (Side by side)` (версия, указанная в `android/build.gradle`, либо последняя стабильная)
   - `CMake`
5. Нажмите **Apply → OK** и дождитесь окончания загрузки.

### 3. Переменные среды Windows

1. Нажмите `Win`, введите **Изменение системных переменных среды** (_Edit the system environment variables_) → кнопка **Переменные среды** (_Environment Variables_).
2. В разделе **Переменные среды пользователя** (_User variables_) нажмите **Создать**:
   - Имя: `ANDROID_HOME`
   - Значение: `C:\Users\<ВАШЕ_ИМЯ_ПОЛЬЗОВАТЕЛЯ>\AppData\Local\Android\Sdk`
3. Проверьте наличие переменной `JAVA_HOME` (установщик Temurin обычно добавляет её сам). Если её нет, создайте:
   - Имя: `JAVA_HOME`
   - Значение: путь к установленному JDK 17 (например, `C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot`)
4. В том же списке выберите переменную **`Path`** → **Изменить** → **Создать** и добавьте:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\cmdline-tools\latest\bin`
5. Нажмите **OK** во всех окнах и откройте **новое** окно PowerShell.

### 4. Проверка окружения (Windows)

```powershell
node -v        # Должно быть v20.x или выше
java -version  # Должно быть openjdk version "17.x"
adb --version  # Должен вывести версию Android Debug Bridge
```

---

## Настройка окружения на macOS (Apple Silicon / Intel)

### 1. Установка Homebrew, Node.js и JDK 17

Откройте **Terminal** и выполните:

```bash
# Если Homebrew ещё не установлен:
/bin/bash -c "$(curl -fsSL [https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh](https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh))"

# Установка Node.js, Watchman и JDK 17
brew install node watchman
brew install --cask zulu@17
```

### 2. Установка Android Studio и SDK

1. Установите Android Studio с [developer.android.com](https://developer.android.com/studio) или через Homebrew:
   ```bash
   brew install --cask android-studio
   ```
2. Запустите **Android Studio**, пройдите мастер установки (_Standard_).
3. Откройте **Settings → Languages & Frameworks → Android SDK**:
   - На вкладке **SDK Platforms** установите платформу, соответствующую `compileSdkVersion` в `android/build.gradle` (например, Android 14 / 15).
   - На вкладке **SDK Tools** (включите _Show Package Details_) установите:
     - `Android SDK Build-Tools`
     - `Android SDK Command-line Tools (latest)`
     - `Android SDK Platform-Tools`
     - `NDK (Side by side)`
     - `CMake`
4. Нажмите **Apply → OK**.

### 3. Переменные среды macOS (`~/.zshrc`)

Откройте файл конфигурации оболочки:

```bash
nano ~/.zshrc
```

Добавьте в конец файла следующие строки:

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

Сохраните файл (`Ctrl+O` → `Enter` → `Ctrl+X`) и примените настройки:

```bash
source ~/.zshrc
```

### 4. Проверка окружения (macOS)

```bash
node -v        # v20.x или выше
java -version  # openjdk version "17.x"
adb --version  # Android Debug Bridge version ...
```

---

## Клонирование репозитория и установка зависимостей

Выполняется одинаково на **Windows** и **macOS**:

```bash
git clone [https://github.com/](https://github.com/)<ваш_ник>/SkiTrackerApp.git
cd SkiTrackerApp
npm install
```

_(Опционально)_ Если Gradle при сборке напишет, что не найден SDK, создайте файл `android/local.properties`:

- **Windows:**
  ```properties
  sdk.dir=C:\\Users\\<ВАШЕ_ИМЯ_ПОЛЬЗОВАТЕЛЯ>\\AppData\\Local\\Android\\Sdk
  ```
- **macOS:**
  ```properties
  sdk.dir=/Users/<ВАШЕ_ИМЯ_ПОЛЬЗОВАТЕЛЯ>/Library/Android/sdk
  ```

---

## Сборка готового Release APK

Первая сборка займёт 3–10 минут, так как Gradle скачает зависимости и скомпилирует нативные модули (`react-native-ble-plx`, `react-native-svg` и др.). Последующие сборки занимают 30–60 секунд.

### На Windows (PowerShell или CMD)

```powershell
cd android
.\gradlew.bat assembleRelease
```

### На macOS (Terminal)

Если репозиторий создавался на Windows, сначала выдайте права на выполнение скрипту `gradlew`:

```bash
cd android
chmod +x gradlew
./gradlew assembleRelease
```

### Где лежит готовый APK

После сообщения **`BUILD SUCCESSFUL`** готовый файл находится здесь:

```text
android/app/build/outputs/apk/release/app-release.apk
```

---

## Установка APK на смартфон

### Способ 1: Обычное копирование

1. Передайте `app-release.apk` на телефон (через USB, Telegram, Google Drive и т.д.).
2. Откройте файл на смартфоне и разрешите установку из неизвестных источников.

### Способ 2: Установка через USB (ADB)

1. Включите на телефоне **Отладку по USB** (_Настройки → Для разработчиков_).
2. Подключите телефон к ПК и выполните из корня проекта:
   ```bash
   adb install -r android/app/build/outputs/apk/release/app-release.apk
   ```

> **Примечание о подписи APK:** По умолчанию `android/app/build.gradle` подписывает `release`-сборку встроенным `debug.keystore`. Этого полностью достаточно для личного использования и установки APK напрямую на любые Android-устройства. Для публикации в Google Play сгенерируйте собственный ключ через `keytool` и подключите его в `signingConfigs.release`.

---

## Запуск в режиме разработки (Dev)

Если нужно править код с мгновенным обновлением на подключённом по USB телефоне:

```bash
# Терминал 1 — запуск Metro-бандлера
npm start

# Терминал 2 — сборка и запуск на Android-устройстве
npm run android
```

---

## Частые проблемы и решения

- **`SDK location not found`:** не задана переменная `ANDROID_HOME` или не перезапущен терминал. Перезапустите терминал или создайте `android/local.properties` вручную (см. раздел выше).
- **`Unsupported class file major version` / ошибка версии Java:** в системе активна не 17-я версия JDK (например, JDK 22 или JDK 11). Проверьте `java -version` и переменную `JAVA_HOME`.
- **`Permission denied: ./gradlew` (macOS):** выполните `chmod +x android/gradlew`.
- **Ошибка сборки после обновления пакетов:** очистите кэш Gradle и пересоберите проект:
  - Windows: `cd android && .\gradlew.bat clean && .\gradlew.bat assembleRelease`
  - macOS: `cd android && ./gradlew clean && ./gradlew assembleRelease`
- **Приложение не находит датчики по Bluetooth:**
  - Убедитесь, что на смартфоне включён **Bluetooth** (а на Android 11 и ниже — также **Геолокация / GPS**).
  - При первом нажатии «Подключить» выдайте приложению все запрошенные разрешения на поиск устройств поблизости.
