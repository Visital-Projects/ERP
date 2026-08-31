const getAll = (Model) => async (req, res) => {
try {
const data = await Model.findAll();
res.json(data);
} catch (err) {
res.status(500).json({ message: 'Server error' });
}
};

const create = (Model) => async (req, res) => {
try {
const data = await Model.create(req.body);
res.status(201).json(data);
} catch (err) {
res.status(500).json({ message: 'Creation failed' });
}
};

const update = (Model) => async (req, res) => {
try {
const item = await Model.findByPk(req.params.id);
if (!item) return res.status(404).json({ message: 'Not found' });

} catch (err) {
res.status(500).json({ message: 'Update failed' });
}
};

const destroy = (Model) => async (req, res) => {
try {
const item = await Model.findByPk(req.params.id);
if (!item) return res.status(404).json({ message: 'Not found' });

} catch (err) {
res.status(500).json({ message: 'Delete failed' });
}
};

module.exports = {
getAll,
create,
update,
destroy,
};