import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField,
  Button,
  MenuItem,
  Toolbar,
  Typography,
  Box,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers";
import ptBR from "date-fns/locale/pt-BR";
import InputMask from "react-input-mask";
import myfetch from "../../lib/myfetch";
import carSchema, { safeParseCar } from "../../validators/carSchema";
import useNotification from "../../ui/useNotification";
import useConfirmDialog from "../../ui/useConfirmDialog";
import useWaiting from "../../ui/useWaiting";

export default function CarForm() {
  const formDefaults = {
    brand: "",
    model: "",
    color: "",
    year_manufacture: "",
    imported: false,
    plates: "",
    selling_date: null,
    selling_price: "",
    customer_id: "",
  };

  const [state, setState] = React.useState({
    car: { ...formDefaults },
    formModified: false,
    customers: [],
    inputErrors: {},
  });
  const { car, customers, formModified, inputErrors } = state;

  const params = useParams();
  const navigate = useNavigate();

  const { askForConfirmation, ConfirmDialog } = useConfirmDialog();
  const { notify, Notification } = useNotification();
  const { showWaiting, Waiting } = useWaiting();

  const colors = [
    { value: "AMARELO", label: "AMARELO" },
    { value: "AZUL", label: "AZUL" },
    { value: "BRANCO", label: "BRANCO" },
    { value: "CINZA", label: "CINZA" },
    { value: "DOURADO", label: "DOURADO" },
    { value: "LARANJA", label: "LARANJA" },
    { value: "MARROM", label: "MARROM" },
    { value: "PRATA", label: "PRATA" },
    { value: "PRETO", label: "PRETO" },
    { value: "ROSA", label: "ROSA" },
    { value: "ROXO", label: "ROXO" },
    { value: "VERDE", label: "VERDE" },
    { value: "VERMELHO", label: "VERMELHO" },
  ];

  const plateMaskFormatChars = {
    9: "[0-9]",
    $: "[0-9A-J]",
    A: "[A-Z]",
  };

  const currentYear = new Date().getFullYear();
  const minYear = 1960;
  const years = [];
  for (let year = currentYear; year >= minYear; year--) {
    years.push(year);
  }

  function handleFieldChange(event) {
    const { name, value, type, checked } = event.target;
    setState((prev) => ({
      ...prev,
      car: {
        ...prev.car,
        [name]: type === "checkbox" ? checked : value,
      },
      formModified: true,
    }));
  }

  function handleImportedChange(event) {
    setState((prev) => ({
      ...prev,
      car: {
        ...prev.car,
        imported: event.target.checked,
      },
      formModified: true,
    }));
  }

  async function handleFormSubmit(event) {
    event.preventDefault();

    // Validação com Zod
    const parsed = safeParseCar(car);
    if (!parsed.success) {
      // Monta objeto de erros para os campos
      const errors = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        errors[field] = issue.message;
      });
      setState((prev) => ({
        ...prev,
        inputErrors: errors,
      }));
      notify("Corrija os erros antes de salvar.", "error");
      return;
    }

    setState((prev) => ({
      ...prev,
      inputErrors: {},
    }));

    showWaiting(true);
    try {
      if (params.id) {
        await myfetch.put(`/cars/${params.id}`, parsed.data);
        notify("Veículo atualizado com sucesso!", "success");
      } else {
        await myfetch.post("/cars", parsed.data);
        notify("Veículo cadastrado com sucesso!", "success");
      }
      navigate("/cars");
    } catch (error) {
      // Se vier erro de validação do backend
      if (error.details?.errors) {
        setState((prev) => ({
          ...prev,
          inputErrors: error.details.errors,
        }));
        notify("Corrija os erros antes de salvar.", "error");
      } else {
        notify(error.message || "Erro ao salvar.", "error");
      }
    } finally {
      showWaiting(false);
    }
  }

  React.useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  async function loadData() {
    if (params.id) {
      showWaiting(true);
      try {
        const result = await myfetch.get(`/cars/${params.id}`);
        setState((prev) => ({
          ...prev,
          car: {
            ...formDefaults,
            ...result,
            selling_date: result.selling_date
              ? new Date(result.selling_date)
              : null,
          },
        }));
      } catch (error) {
        notify("Erro ao carregar dados do veículo.", "error");
      } finally {
        showWaiting(false);
      }
    }
    // Se precisar carregar clientes, adicione aqui
  }

  function handleBackButtonClick() {
    if (formModified) {
      askForConfirmation("Descartar alterações?", () => navigate("/cars"));
    } else {
      navigate("/cars");
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleFormSubmit}
      onKeyDown={handleKeyDown}
      sx={{ p: 2, maxWidth: 500, mx: "auto" }}
    >
      <Toolbar>
        <Typography variant="h6">
          {params.id ? "Editar Veículo" : "Cadastrar Veículo"}
        </Typography>
      </Toolbar>

      <TextField
        name="brand"
        label="Marca"
        variant="filled"
        required
        fullWidth
        value={car.brand}
        onChange={handleFieldChange}
        helperText={inputErrors.brand}
        error={!!inputErrors.brand}
        sx={{ mb: 2 }}
      />

      <TextField
        name="model"
        label="Modelo"
        variant="filled"
        required
        fullWidth
        value={car.model}
        onChange={handleFieldChange}
        helperText={inputErrors.model}
        error={!!inputErrors.model}
        sx={{ mb: 2 }}
      />

      <TextField
        name="color"
        label="Cor"
        variant="filled"
        required
        select
        fullWidth
        value={car.color}
        onChange={handleFieldChange}
        helperText={inputErrors.color}
        error={!!inputErrors.color}
        sx={{ mb: 2 }}
      >
        {colors.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        name="year_manufacture"
        label="Ano de fabricação"
        variant="filled"
        required
        select
        fullWidth
        value={car.year_manufacture}
        onChange={handleFieldChange}
        helperText={inputErrors.year_manufacture}
        error={!!inputErrors.year_manufacture}
        sx={{ mb: 2 }}
      >
        {years.map((year) => (
          <MenuItem key={year} value={year}>
            {year}
          </MenuItem>
        ))}
      </TextField>

      <FormControlLabel
        control={
          <Switch
            checked={!!car.imported}
            onChange={handleImportedChange}
            name="imported"
            color="primary"
          />
        }
        label="Importado"
        sx={{ mb: 2 }}
      />

      <InputMask
        mask="AAA-9$99"
        formatChars={plateMaskFormatChars}
        maskChar=" "
        value={car.plates}
        onChange={handleFieldChange}
      >
        {() => (
          <TextField
            name="plates"
            label="Placa"
            variant="filled"
            required
            fullWidth
            helperText={inputErrors.plates}
            error={!!inputErrors.plates}
            sx={{ mb: 2 }}
          />
        )}
      </InputMask>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <DatePicker
          label="Data de venda"
          value={car.selling_date}
          onChange={(value) =>
            handleFieldChange({
              target: { name: "selling_date", value },
            })
          }
          slotProps={{
            textField: {
              variant: "filled",
              fullWidth: true,
              helperText: inputErrors.selling_date,
              error: !!inputErrors.selling_date,
              sx: { mb: 2 },
            },
          }}
        />
      </LocalizationProvider>

      <TextField
        name="selling_price"
        label="Preço de venda"
        variant="filled"
        type="number"
        fullWidth
        value={car.selling_price}
        onChange={handleFieldChange}
        helperText={inputErrors.selling_price}
        error={!!inputErrors.selling_price}
        sx={{ mb: 2 }}
      />

      {/* Adicione outros campos conforme necessário */}

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" color="primary">
          {params.id ? "Salvar alterações" : "Cadastrar"}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleBackButtonClick}
        >
          Voltar
        </Button>
      </Box>

      <ConfirmDialog />
      <Notification />
      <Waiting />
    </Box>
  );
}
