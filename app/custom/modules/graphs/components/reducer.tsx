export const initialState = {
  formData: {
    id: "",
    entityId: "",
    title: "",
    description: "",
    visualizationType: "",
    groupBy: [],
    subGroupBy: [""],
    metrics: [],
    tenantIds: [],
    filters: [{ field: "", operator: "=", value: "", fieldId: "" }],
    computedFields: [{ field_a: "", field_b: "", operator: "", field_a_id: "", field_b_id: "" }],
    timeGranularity: "",
    graphWidth: "",
    entitySlug: "",
    groupSlug: "",
    dateField: "",
    compareWith: { entityId: "", dateField: "", timeShift: "" },
  },
  entityProperties: [],
  selectedFilter: "",
  selectedInputType: "text",
  isEdit: false,
  isDelete: "false",
};

export const actionTypes = {
  SET_TENANT: "SET_TENANT",
  SET_ENTITY_PROPERTIES: "SET_ENTITY_PROPERTIES",
  SET_FORM_DATA: "SET_FORM_DATA",
  SET_GROUP_BY: "SET_GROUP_BY",
  SET_METRICS: "SET_METRICS",
  ADD_COMPUTED_FIELD: "ADD_COMPUTED_FIELD",
  REMOVE_COMPUTED_FIELD: "REMOVE_COMPUTED_FIELD",
  SET_COMPUTED_FIELD_A: "SET_COMPUTED_FIELD_A",
  SET_COMPUTED_FIELD_B: "SET_COMPUTED_FIELD_B",
  SET_COMPUTED_OPERATOR: "SET_COMPUTED_OPERATOR",
  SET_COMPARE_WITH: "SET_COMPARE_WITH",
  ADD_FILTER: "ADD_FILTER",
  SET_FILTER_FIELD: "SET_FILTER_FIELD",
  SET_FILTER_OPERATOR: "SET_FILTER_OPERATOR",
  SET_FILTER_VALUE: "SET_FILTER_VALUE",
  REMOVE_FILTER: "REMOVE_FILTER",
  SET_SELECTED_ENTITY: "SET_SELECTED_ENTITY",
  RESET: "RESET",
  SET_INITIAL_STATE: "SET_INITIAL_STATE",
};

function reducer(state: any, action: { type: string; payload: any }) {
  switch (action.type) {
    case actionTypes.SET_ENTITY_PROPERTIES:
      return { ...state, entityProperties: action.payload };

    case actionTypes.SET_SELECTED_ENTITY:
      return {
        ...state,
        formData: {
          ...state.formData,
          entityId: action.payload.entityId,
        },
        selectedEntityName: action.payload.selectedEntityName,
      };

    case actionTypes.SET_FORM_DATA:
      return { ...state, formData: { ...state.formData, [action.payload.name]: action.payload.value } };

    case actionTypes.SET_GROUP_BY:
      return { ...state, formData: { ...state.formData, groupBy: action.payload } };

    case actionTypes.SET_METRICS:
      return { ...state, formData: { ...state.formData, metrics: action.payload } };

    case actionTypes.SET_TENANT:
      return { ...state, formData: { ...state.formData, tenantIds: action.payload } };

    case actionTypes.ADD_COMPUTED_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          computedFields: [...state.formData.computedFields, { field_a: "", field_b: "", operator: "+", field_a_id: "", field_b_id: "" }],
        },
      };

    case actionTypes.REMOVE_COMPUTED_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          computedFields: state.formData.computedFields.filter((_: any, idx: any) => idx !== action.payload),
        },
      };

    case actionTypes.SET_COMPUTED_FIELD_A: {
      const { index, field_a, field_a_id } = action.payload;
      const updatedComputedFields = state.formData.computedFields.map((f: any, i: any) => (i === index ? { ...f, field_a, field_a_id } : f));
      return { ...state, formData: { ...state.formData, computedFields: updatedComputedFields } };
    }

    case actionTypes.SET_COMPUTED_OPERATOR: {
      const { index, operator } = action.payload;
      const updatedComputedFields = state.formData.computedFields.map((f: any, i: any) => (i === index ? { ...f, operator } : f));
      return { ...state, formData: { ...state.formData, computedFields: updatedComputedFields } };
    }

    case actionTypes.SET_COMPUTED_FIELD_B: {
      const { index, field_b, field_b_id } = action.payload;
      const updatedComputedFields = state.formData.computedFields.map((f: any, i: any) => (i === index ? { ...f, field_b, field_b_id } : f));
      return { ...state, formData: { ...state.formData, computedFields: updatedComputedFields } };
    }

    case actionTypes.SET_COMPARE_WITH:
      return { ...state, formData: { ...state.formData, compareWith: action.payload } };

    case actionTypes.ADD_FILTER: {
      const newFilter = { field: "", operator: "=", value: "", fieldId: "" };
      return { ...state, formData: { ...state.formData, filters: [...state.formData.filters, newFilter] } };
    }

    case actionTypes.REMOVE_FILTER: {
      const updatedFilters = state.formData.filters.filter((_: any, index: any) => index !== action.payload);
      return { ...state, formData: { ...state.formData, filters: updatedFilters } };
    }

    case actionTypes.SET_FILTER_FIELD: {
      const { index, field, fieldId } = action.payload;
      const updatedFilters = state.formData.filters.map((filter: any, i: any) => (i === index ? { ...filter, field, fieldId } : filter));
      return { ...state, formData: { ...state.formData, filters: updatedFilters } };
    }

    case actionTypes.SET_FILTER_OPERATOR: {
      const { index, operator } = action.payload;
      const updatedFilters = state.formData.filters.map((filter: any, i: any) => (i === index ? { ...filter, operator } : filter));
      return { ...state, formData: { ...state.formData, filters: updatedFilters } };
    }

    case actionTypes.SET_FILTER_VALUE: {
      const { index, value } = action.payload;
      const updatedFilters = state.formData.filters.map((filter: any, i: any) => (i === index ? { ...filter, value } : filter));
      return { ...state, formData: { ...state.formData, filters: updatedFilters } };
    }

    case actionTypes.RESET:
      return initialState;

    case actionTypes.SET_INITIAL_STATE:
      return {
        ...state,
        isEdit: action.payload.isEdit,
        ...action.payload,
      };

    default:
      return state;
  }
}
export default reducer;
