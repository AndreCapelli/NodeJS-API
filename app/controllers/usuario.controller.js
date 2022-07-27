const db = require("../models");
const Usuario = db.usuarios;
const Op = db.Sequelize.Op;
// Create and Save a new Usuario
exports.create = (req, res) => {
  // Validate request
  if (!req.body.UsNome || !req.body.UsLogin || !req.body.UsSenha) {
    res.status(406).json({
      message: "Conteudo não pode ser vazio",
    });
    return;
  }
  // Create a new Usuario
  const usuario = {
    UsNome: req.body.UsNome,
    UsLogin: req.body.UsLogin,
    UsSenha: req.body.UsSenha,
  };
  // Save Usuario in the database
  Usuario.create(usuario)
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while creating the New User.",
      });
    });
};
// Retrieve all Usuarios from the database.
exports.findAll = (req, res) => {
  const usNome = req.query.UsNome;
  var condition = usNome ? { usNome: { [Op.like]: `%${usNome}%` } } : null;
  Usuario.findAll({
    where: { UsAtivo: true },
    attributes: ["Usuarios_ID", "UsNome", "UsLogin", "UsSenha"],
  })
    .then((data) => {
      if (!data) {
        res.status(204).json({ message: "Nenhum conteudo" });
        return;
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Usuarios.",
      });
    });
};
// Find a single Usuario with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Usuario.findByPk(id, {
    attributes: ["Usuarios_ID", "UsNome", "UsLogin", "UsSenha"],
  })
    .then((data) => {
      if (!data) {
        res.status(204).json({ message: "Nenhum conteudo" });
        return;
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Usuario with id=" + id,
      });
    });
};

//Faz a comparação do Login
exports.login = (req, res) => {
  async function RetornaJsonLogin() {
    const loginRes = await Usuario.findOne({
      where: {
        UsLogin: user,
        UsSenha: pass,
      },
      attributes: ["Usuarios_ID", "UsNome"],
    })
      .then((data) => {
        if (!data) {
          res.status(204).json({
            message: `Usuário\ Senha inválidos`,
          });
        } else {
          res.status(200).json(data);
        }
      })
      .catch((err) => {
        res
          .status(500)
          .send({ message: err.message || "Erro ao validar credenciais" });
      });

    return loginRes;
  }

  const user = req.params.User;
  const pass = req.params.Pass;

  if (!user || !pass) {
    res.status(406).json({
      message: "Não é possível fazer o login",
    });
    return;
  } else {
    RetornaJsonLogin();
  }
};

// Update a Usuario by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  if (!id) {
    res
      .status(406)
      .send({ message: "ID necessário para concluir essa solicitação" });
    return;
  }

  Usuario.update(req.body, {
    where: { Usuarios_ID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.status(200).json({
          message: "Usuario was updated successfully.",
        });
        return;
      } else {
        res.status(406).send({
          message: `Cannot update Usuario with id=${id}. Maybe Usuario was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Usuario with id=" + id,
      });
    });
};
// Delete a Usuario with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  if (!id) {
    res
      .status(406)
      .send({ message: "ID necessário para concluir essa solicitação" });
    return;
  }

  Usuario.destroy({
    where: { Usuarios_ID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.status(200).json({
          message: "Usuario was deleted successfully.",
        });
      } else {
        res.status(406).send({
          message: `Cannot delete Usuario with id=${id}. Maybe Usuario was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Usuario with id=" + id,
      });
    });
};
