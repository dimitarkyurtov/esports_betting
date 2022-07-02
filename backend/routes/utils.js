export function sendErrorResponse(req, res, status, message, err) {
    if(req.get('env') === 'production') {
        err = undefined;
    }
    res.status(status).json({
        code: status,
        message,
        error: err
    })
}

export function replace_id (entity) {
    entity.id = entity._id;
    delete entity._id;
    return entity;
}