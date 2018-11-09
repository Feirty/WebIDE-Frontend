const defaultOption = {
    historyVersions: [],
    version: '0.0.0',
    versionId: '',
    status: 0,
    hasPrePublish: false,
    preVersionId: '',
    isPrePublishBuilding: false,
}

function parseStatus(pluginVersions) {
    const len = pluginVersions.length;
    if (len === 0) {
        // 尚未发布
        return defaultOption;
    }
    const pub = [];
    //const pre = [];
    let hasPrePublish = false;
    let preVersionId = '';
    let isPrePublishBuilding = false;
    for (let i = 0; i < len; i++) {
        const item = pluginVersions[i];
        // 预发布的版本。isPreDeploy = true 代表 已经预发布，isPreDeploy = false 并且 isDeleted = true 代表已经取消预发布
        if (item.isPreDeploy || item.isDeleted) {
            //pre.push(item);
            hasPrePublish = item.isPreDeploy;
            isPrePublishBuilding = item.buildStatus === 1;
            preVersionId = item.id;
        } else {
            pub.unshift(item);
        }
    }
    const v = pub[0];
    if (!v || typeof v !== 'object') {
        // 尚未正式发布
        return {
            ...defaultOption,
            hasPrePublish,
            preVersionId,
            isPrePublishBuilding,
        };
    }
    const auditStatus = v.auditStatus; // 1 审核中; 2 审核成功; 3 审核失败
    const buildStatus = v.buildStatus; // 1 构建中; 2 构建成功; 3 构建失败
    let status = 0;
    if (auditStatus === 1) {
        // 审核中
        status = 1;
    } else if (auditStatus === 2) {
        if (buildStatus === 1) {
            // 构建中
            status = 3;
        } else if (buildStatus === 2) {
            // 发布成功
            status = 5;
        } else if (buildStatus === 3) {
            // 构建失败
            status = 4;
        }
    } else if (auditStatus === 3) {
        // 审核失败
        status = 2;
    }
    return {
        historyVersions: pub,
        version: v.buildVersion,
        versionId: v.id,
        status,
        hasPrePublish,
        preVersionId,
        isPrePublishBuilding,
        auditRemark: v.auditRemark || '存在安全隐患',
    };
}

export default parseStatus;
