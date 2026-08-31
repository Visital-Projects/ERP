import React from 'react';

const Permissions = ({
  permissions,
  formData,
  setFormData,
  activeTab,
  PERMISSIONS_BY_TAB,
}) => {
  const handleCheckboxChange = (id) => {
    setFormData((prev) => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(id)
        ? prev.permission_ids.filter((pid) => pid !== id)
        : [...prev.permission_ids, id],
    }));
  };

  const isModuleChecked = (module) => {
    const modulePermissions = module.actions
      .map((action) =>
        permissions.find(
          (p) =>
            p.name.toLowerCase() === `${module.name} ${action}`.toLowerCase()
        )
      )
      .filter(Boolean);

    return (
      modulePermissions.length > 0 &&
      modulePermissions.every((perm) => formData.permission_ids.includes(perm.id))
    );
  };

  const handleModuleCheck = (module, checked) => {
    const newIds = [...formData.permission_ids];

    module.actions.forEach((action) => {
      const permission = permissions.find(
        (p) =>
          p.name.toLowerCase() === `${module.name} ${action}`.toLowerCase()
      );
      if (!permission) return;

      const exists = newIds.includes(permission.id);
      if (checked && !exists) {
        newIds.push(permission.id);
      } else if (!checked && exists) {
        const index = newIds.indexOf(permission.id);
        newIds.splice(index, 1);
      }
    });

    setFormData({ ...formData, permission_ids: [...new Set(newIds)] });
  };

  return (
    <>
      {PERMISSIONS_BY_TAB[activeTab].map((module, idx) => (
        <div key={idx} className="flex items-start px-4 py-3 border-t">
          {/* Module checkbox */}
          <div className="w-1/3 flex items-start">
            <input
              type="checkbox"
              checked={isModuleChecked(module)}
              onChange={(e) => handleModuleCheck(module, e.target.checked)}
              className="form-checkbox h-4 w-4 text-green-500 mt-1 mr-2"
            />
            <span className="font-medium">{module.name}</span>
          </div>

          {/* Sub-permissions */}
          <div className="w-2/3 grid grid-cols-2 gap-2">
            {module.actions.map((action, i) => {
              const permission = permissions.find(
                (p) =>
                  p.name.toLowerCase() === `${module.name} ${action}`.toLowerCase()
              );

              if (!permission) return null;

              return (
                <label key={i} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permission_ids.includes(permission.id)}
                    onChange={() => handleCheckboxChange(permission.id)}
                    className="form-checkbox h-4 w-4 text-green-500 mr-2"
                  />
                  <span>{action}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
};

export default Permissions;
