import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const CommissionModal = ({ show, onHide, commission, employeeId, createdBy, onSave }) => {
    const [title, setTitle] = useState(commission?.title || '');
    const [type, setType] = useState(commission?.type || 'Fixed');
    const [amount, setAmount] = useState(commission?.amount || '');

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                employee_id: Number(employeeId),
                title,
                amount,
                type,
                created_by: createdBy || 1,
            };

            if (commission) {
                await commissionService.updateCommission(commission.id, payload);
            } else {
                await commissionService.createCommission(payload);
            }

            onSave();
            onHide();
        } catch (err) {
            console.error("Error saving commission", err);
            alert("Failed to save commission");
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{commission ? 'Edit' : 'Add'} Commission</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSave}>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mt-2">
                        <Form.Label>Type</Form.Label>
                        <Form.Select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="Fixed">Fixed</option>
                            <option value="Percentage">Percentage</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mt-2">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            placeholder={
                                type === 'Percentage'
                                    ? 'Enter % value'
                                    : 'Enter fixed amount'
                            }
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                        Save
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CommissionModal;