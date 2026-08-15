const fs = require('fs/promises');
const path = require('path');

const {
  createRunOncePlugin,
  IOSConfig,
  withDangerousMod,
  withXcodeProject,
} = require('expo/config-plugins');

const TARGET_NAME = 'MensDisciplineDeviceActivityMonitor';
const TARGET_BUNDLE_IDENTIFIER =
  'com.temperline.mensdiscipline.deviceactivitymonitor';
const TARGET_SOURCE_FILES = [
  'DeviceActivityMonitorExtension.swift',
  'ExpoFamilyControlsSharedState.swift',
];

function unquote(value) {
  return typeof value === 'string' ? value.replace(/^"|"$/g, '') : value;
}

function findNativeTarget(project, targetName) {
  return Object.entries(project.pbxNativeTargetSection()).find(
    ([key, target]) =>
      !key.endsWith('_comment') && unquote(target.name) === targetName
  );
}

function ensureTargetFiles(config) {
  return withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      if (modConfig.modRequest.introspect) {
        return modConfig;
      }

      const projectRoot = modConfig.modRequest.projectRoot;
      const targetRoot = path.join(
        modConfig.modRequest.platformProjectRoot,
        TARGET_NAME
      );
      await fs.mkdir(targetRoot, { recursive: true });

      const files = [
        {
          source: path.join(
            projectRoot,
            'targets/device-activity-monitor/DeviceActivityMonitorExtension.swift'
          ),
          destination: path.join(
            targetRoot,
            'DeviceActivityMonitorExtension.swift'
          ),
        },
        {
          source: path.join(
            projectRoot,
            'modules/family-controls/ios/ExpoFamilyControlsSharedState.swift'
          ),
          destination: path.join(
            targetRoot,
            'ExpoFamilyControlsSharedState.swift'
          ),
        },
        {
          source: path.join(
            projectRoot,
            'targets/device-activity-monitor/Info.plist'
          ),
          destination: path.join(targetRoot, 'Info.plist'),
        },
        {
          source: path.join(
            projectRoot,
            'targets/device-activity-monitor/MensDisciplineDeviceActivityMonitor.entitlements'
          ),
          destination: path.join(
            targetRoot,
            'MensDisciplineDeviceActivityMonitor.entitlements'
          ),
        },
      ];

      await Promise.all(
        files.map(({ source, destination }) =>
          fs.copyFile(source, destination)
        )
      );
      return modConfig;
    },
  ]);
}

function ensureBuildPhases(project, targetUuid) {
  const target = project.pbxNativeTargetSection()[targetUuid];
  const phaseNames = new Set(
    (target.buildPhases || []).map((phase) => phase.comment)
  );

  if (!phaseNames.has('Sources')) {
    project.addBuildPhase(
      [],
      'PBXSourcesBuildPhase',
      'Sources',
      targetUuid
    );
  }
  if (!phaseNames.has('Frameworks')) {
    project.addBuildPhase(
      [],
      'PBXFrameworksBuildPhase',
      'Frameworks',
      targetUuid
    );
  }
}

function ensureSourceFiles(project, targetUuid) {
  IOSConfig.XcodeUtils.ensureGroupRecursively(project, TARGET_NAME);

  for (const sourceFile of TARGET_SOURCE_FILES) {
    const filepath = `${TARGET_NAME}/${sourceFile}`;
    if (!project.hasFile(filepath)) {
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
        filepath,
        groupName: TARGET_NAME,
        project,
        targetUuid,
      });
    }
  }

  for (const supportFile of [
    'Info.plist',
    'MensDisciplineDeviceActivityMonitor.entitlements',
  ]) {
    const filepath = `${TARGET_NAME}/${supportFile}`;
    if (!project.hasFile(filepath)) {
      const group = project.pbxGroupByName(TARGET_NAME);
      project.addFile(filepath, findGroupKey(project, group));
    }
  }
}

function findGroupKey(project, group) {
  return Object.entries(project.hash.project.objects.PBXGroup).find(
    ([key, value]) => !key.endsWith('_comment') && value === group
  )?.[0];
}

function ensureFrameworks(project, targetUuid) {
  for (const framework of [
    'DeviceActivity.framework',
    'FamilyControls.framework',
    'ManagedSettings.framework',
  ]) {
    if (!project.hasFile(`System/Library/Frameworks/${framework}`)) {
      project.addFramework(framework, { target: targetUuid });
    }
  }
}

function configureBuildSettings(project, targetUuid, marketingVersion) {
  const target = project.pbxNativeTargetSection()[targetUuid];
  const applicationTarget = IOSConfig.XcodeUtils.getApplicationNativeTarget({
    project,
    projectName: unquote(project.getFirstTarget().firstTarget.name),
  });
  const applicationConfigurations =
    IOSConfig.XcodeUtils.getBuildConfigurationsForListId(
      project,
      applicationTarget.target.buildConfigurationList
    );
  const appSettingsByName = new Map(
    applicationConfigurations.map(([, configuration]) => [
      unquote(configuration.name),
      configuration.buildSettings,
    ])
  );

  const targetConfigurations =
    IOSConfig.XcodeUtils.getBuildConfigurationsForListId(
      project,
      target.buildConfigurationList
    );

  for (const [, configuration] of targetConfigurations) {
    const buildSettings = configuration.buildSettings;
    const appSettings = appSettingsByName.get(unquote(configuration.name)) || {};
    buildSettings.APPLICATION_EXTENSION_API_ONLY = 'YES';
    buildSettings.CODE_SIGN_ENTITLEMENTS = `${TARGET_NAME}/${TARGET_NAME}.entitlements`;
    buildSettings.CODE_SIGN_STYLE = 'Automatic';
    buildSettings.CURRENT_PROJECT_VERSION =
      appSettings.CURRENT_PROJECT_VERSION || '1';
    buildSettings.GENERATE_INFOPLIST_FILE = 'NO';
    buildSettings.INFOPLIST_FILE = `${TARGET_NAME}/Info.plist`;
    buildSettings.IPHONEOS_DEPLOYMENT_TARGET =
      appSettings.IPHONEOS_DEPLOYMENT_TARGET || '16.4';
    buildSettings.MARKETING_VERSION =
      marketingVersion || appSettings.MARKETING_VERSION || '1.0';
    buildSettings.PRODUCT_BUNDLE_IDENTIFIER = TARGET_BUNDLE_IDENTIFIER;
    buildSettings.PRODUCT_NAME = '"$(TARGET_NAME)"';
    buildSettings.SKIP_INSTALL = 'YES';
    buildSettings.SWIFT_VERSION = appSettings.SWIFT_VERSION || '5.0';
    buildSettings.TARGETED_DEVICE_FAMILY = '1';

    if (appSettings.DEVELOPMENT_TEAM) {
      buildSettings.DEVELOPMENT_TEAM = appSettings.DEVELOPMENT_TEAM;
    }
  }
}

function configureTargetAttributes(project, targetUuid) {
  const firstProject = project.getFirstProject().firstProject;
  firstProject.attributes = firstProject.attributes || {};
  firstProject.attributes.TargetAttributes =
    firstProject.attributes.TargetAttributes || {};
  firstProject.attributes.TargetAttributes[targetUuid] = {
    ...(firstProject.attributes.TargetAttributes[targetUuid] || {}),
    CreatedOnToolsVersion: '26.0',
    ProvisioningStyle: 'Automatic',
  };
}

function ensureApplicationTargetDependency(project, targetUuid) {
  const applicationTarget = project.getFirstTarget();
  const objects = project.hash.project.objects;
  objects.PBXContainerItemProxy = objects.PBXContainerItemProxy || {};
  objects.PBXTargetDependency = objects.PBXTargetDependency || {};

  const alreadyDependsOnTarget = (
    applicationTarget.firstTarget.dependencies || []
  ).some((dependency) => {
    const dependencyObject = objects.PBXTargetDependency[dependency.value];
    return dependencyObject?.target === targetUuid;
  });

  if (!alreadyDependsOnTarget) {
    project.addTargetDependency(applicationTarget.uuid, [targetUuid]);
  }
}

function removeUndefinedProjectValues(value) {
  if (!value || typeof value !== 'object') {
    return;
  }

  for (const key of Object.keys(value)) {
    if (value[key] === undefined) {
      delete value[key];
    } else {
      removeUndefinedProjectValues(value[key]);
    }
  }
}

function ensureExtensionTarget(config) {
  return withXcodeProject(config, (modConfig) => {
    const project = modConfig.modResults;
    let targetEntry = findNativeTarget(project, TARGET_NAME);

    if (!targetEntry) {
      const addedTarget = project.addTarget(
        TARGET_NAME,
        'app_extension',
        TARGET_NAME,
        TARGET_BUNDLE_IDENTIFIER
      );
      targetEntry = [addedTarget.uuid, addedTarget.pbxNativeTarget];
    }

    const [targetUuid] = targetEntry;
    ensureBuildPhases(project, targetUuid);
    ensureSourceFiles(project, targetUuid);
    ensureFrameworks(project, targetUuid);
    configureBuildSettings(project, targetUuid, modConfig.version);
    configureTargetAttributes(project, targetUuid);
    ensureApplicationTargetDependency(project, targetUuid);
    removeUndefinedProjectValues(project.hash.project.objects);
    return modConfig;
  });
}

function withDeviceActivityMonitor(config) {
  config = ensureTargetFiles(config);
  return ensureExtensionTarget(config);
}

module.exports = createRunOncePlugin(
  withDeviceActivityMonitor,
  'with-device-activity-monitor',
  '1.0.0'
);
