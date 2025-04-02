import { Form, useNavigate, useFetcher } from "@remix-run/react";
import { useEffect, useReducer, useState } from "react";
import toast from "react-hot-toast";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import InputCombobox from "~/components/ui/input/InputCombobox";
import InputSelect from "~/components/ui/input/InputSelect";
import InputText from "~/components/ui/input/InputText";
import { Textarea } from "~/components/ui/textarea";
import reducer, { actionTypes, initialState } from "./reducer";

const mergeDataWithInitialState = (initialState: any, newData: any) => {
  const isEdit = !!newData;
  return {
    ...initialState,
    isEdit,
    formData: {
      ...initialState.formData,
      ...newData,
      tenantIds: newData.tenantId,
      filters: newData.filters?.length
        ? newData.filters.map((f: any) => ({
          field: f.field || "",
          operator: f.operator || "=",
          value: f.value || "",
          fieldId: f.fieldId || "",
        }))
        : [],
      computedFields: newData.computedFields?.length
        ? newData.computedFields.map((c: any) => ({
          field_a: c.fieldA || "",
          field_b: c.fieldB || "",
          operator: c.operator || "",
          field_a_id: c.field_a_id || "",
          field_b_id: c.field_b_id || "",
        }))
        : initialState.formData.computedFields,
      compareWith: newData.compareWith || initialState.formData.compareWith,
    },
  };
};

const DynamicGraphForm = ({ entities, initialValues, groups, tenants }: any) => {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [activeModule, setActiveModule] = useState("basic");
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      navigate("/admin/entities/graphs");
    }
  }, [fetcher.state, fetcher.data, navigate]);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      const mergedState = mergeDataWithInitialState(initialState, initialValues);
      dispatch({ type: actionTypes.SET_INITIAL_STATE, payload: mergedState });
    }

  }, [initialValues]);


  useEffect(() => {
    const entity = entities.find((e: any) => e.id === state.formData.entityId);
    if (entity && entity.properties) {
      dispatch({ type: actionTypes.SET_ENTITY_PROPERTIES, payload: entity.properties });
    } else {
      dispatch({ type: actionTypes.SET_ENTITY_PROPERTIES, payload: [] });
    }
  }, [state.formData.entityId, entities]);

  const getInputType = (propertyType: any) => {
    switch (propertyType) {
      case PropertyType.NUMBER:
        return "number";
      case PropertyType.TEXT:
        return "text";
      case PropertyType.DATE:
        return "date";
      case PropertyType.MEDIA:
        return "file";
      case PropertyType.SELECT:
        return "select";
      case PropertyType.BOOLEAN:
        return "checkbox";
      case PropertyType.MULTI_SELECT:
        return "multi-select";
      case PropertyType.MULTI_TEXT:
        return "textarea";
      case PropertyType.RANGE_NUMBER:
        return "range";
      case PropertyType.RANGE_DATE:
        return "date-range";
      case PropertyType.FORMULA:
        return "text";
      default:
        return "text";
    }
  };
  const handleNavigate = () => {
    navigate("/admin/entities/graphs");
  };

  const onSubmit = (e: any) => {
    e.preventDefault();

    if (
      (state.formData.visualizationType === "stat chart" && (!state.formData.entityId || !state.formData.tenantIds ||
        !state.formData.groupSlug)) ||
      (state.formData.visualizationType !== "stat chart" && (
        !state.formData.visualizationType ||
        !state.formData.entityId ||
        !state.formData.tenantIds ||
        !state.formData.groupSlug ||
        (Array.isArray(state.formData.groupBy) &&
          Array.isArray(state.formData.metrics) &&
          state.formData.groupBy.length === 0 &&
          state.formData.metrics.length === 0) ||
        (Array.isArray(state.formData.tenantIds) && state.formData.tenantIds.length === 0)
      ))) {
      toast("Fill all required fields");
      return;
    }


    const formData = new FormData();
    formData.append("id", state.formData.id);
    formData.append("tenantIds", JSON.stringify(state.formData.tenantIds));
    formData.append("entityId", state.formData.entityId);
    formData.append("title", state.formData.title);
    formData.append("description", state.formData.description);
    formData.append("visualizationType", state.formData.visualizationType);
    formData.append("timeGranularity", state.formData.timeGranularity);
    formData.append("graphWidth", state.formData.graphWidth);
    formData.append("entitySlug", state.formData.entitySlug);
    formData.append("groupSlug", state.formData.groupSlug);
    formData.append("dateField", state.formData.dateField);
    formData.append("groupBy", JSON.stringify(state.formData.groupBy));
    formData.append("subGroupBy", JSON.stringify(state.formData.subGroupBy));
    formData.append("metrics", JSON.stringify(state.formData.metrics));
    formData.append("filters", JSON.stringify(state.formData.filters));
    formData.append("computedFields", JSON.stringify(state.formData.computedFields));
    formData.append("compareWith", JSON.stringify(state.formData.compareWith));
    formData.append("isEdit", state.isEdit);
    formData.append("isDelete", state.isDelete);

    fetcher.submit(formData, { method: "post" });
  };

  return (
    <div className="max-h-screen p-6">
      <div className="mb-4 flex items-center justify-between px-4">
        <h2 className="text-xl font-semibold">Dynamic Graph Form</h2>
        <button className="self-end rounded-lg bg-black px-4 py-2 font-semibold text-white" onClick={handleNavigate}>
          Configured Charts
        </button>
      </div>

      <Form method="post" onSubmit={onSubmit}>
        <div className="flex h-full max-h-[400px]">
          <div className="bg-white-50 h-full w-1/4 p-4">
            <div
              className={`border ${activeModule === "basic"
                  ? "border-gray-200 bg-gray-100 font-bold text-gray-900 shadow-sm"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } flex items-center overflow-hidden rounded-md px-3 py-2 text-sm`}
              onClick={() => setActiveModule("basic")}
            >
              Basic Information
            </div>
            <div
              className={`border ${activeModule === "advanced"
                  ? "border-gray-200 bg-gray-100 font-bold text-gray-900 shadow-sm"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } flex items-center overflow-hidden rounded-md px-3 py-2 text-sm`}
              onClick={() => setActiveModule("advanced")}
            >
              Advanced Settings
            </div>
          </div>
          <div className="w-3/4">
            {activeModule === "basic" && (
              <div className="bg-white-50 mx-auto max-w-4xl rounded-lg p-4">
                <h3 className="mb-2 text-base font-bold text-[#180505]">Graph Info</h3>
                <hr className="mb-3 h-0.5" />
                <div className="mb-3 flex justify-between gap-4">
                  <div className="w-1/2">
                    <InputText
                      type="text"
                      name="title"
                      title="Title"
                      required={true}
                      value={state.formData.title}
                      setValue={(val) =>
                        dispatch({
                          type: actionTypes.SET_FORM_DATA,
                          payload: { name: "title", value: val },
                        })
                      }
                      placeholder="Title"
                      className="w-full"
                    />
                  </div>

                  <div className="w-1/2">
                    <InputText
                      type="text"
                      name="description"
                      title="Description"
                      required={true}
                      value={state.formData.description}
                      setValue={(val) =>
                        dispatch({
                          type: actionTypes.SET_FORM_DATA,
                          payload: { name: "description", value: val },
                        })
                      }
                      placeholder="Description"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-4">
                  <div className="w-1/2">
                    <InputSelect
                      name="visualizationType"
                      title="Visualization Type"
                      required={true}
                      value={state.formData.visualizationType}
                      withSearch={false}
                      placeholder="visualization type"
                      options={[
                        { name: "Pie Chart", value: "pie chart" },
                        { name: "Bar Chart", value: "bar chart" },
                        { name: "Stat Chart", value: "stat chart" },
                        { name: "Line Chart", value: "line chart" },
                        { name: "Trend Chart", value: "trend chart" },
                      ]}
                      setValue={(selectedValue) => {
                        dispatch({
                          type: actionTypes.SET_FORM_DATA,
                          payload: { name: "visualizationType", value: selectedValue },
                        });
                      }}
                      className="w-full text-black"
                    />
                  </div>
                  <div className="w-1/2">
                    <InputCombobox
                      name="tenantId"
                      title="Select Tenant"
                      value={state.formData.tenantIds}
                      required={true}
                      options={
                        tenants?.map((tenant: any) => ({
                          name: tenant.name,
                          value: tenant.slug,
                        })) || []
                      }
                      onChange={(selectedValues) => {
                        const updatedGroupBy = selectedValues.map((property: any) => {
                          const existing = tenants.find((g: any) => g.slug === property);
                          return existing.slug;
                        });
                        dispatch({ type: actionTypes.SET_TENANT, payload: updatedGroupBy });
                      }}
                      selectPlaceholder="Select Tenant"
                      className="w-full"
                    />
                  </div>
                </div>

                <h3 className="mb-2 mt-6 text-base font-bold text-[#180505]">Entity Details</h3>
                <hr className="mb-3 h-0.5" />
                <div className="flex w-full gap-4">
                  <div className="w-1/2">
                    <InputSelect
                      name="entityId"
                      title="EntityId"
                      required={true}
                      value={state.formData.entityId}
                      placeholder="select entity"
                      options={
                        entities?.map((entity: any) => ({
                          name: entity.name,
                          value: entity.id,
                        })) || []
                      }
                      setValue={(selectedValue) => {
                        const selectedEntity = entities.find((entity: any) => entity.id === selectedValue);
                        dispatch({
                          type: actionTypes.SET_FORM_DATA,
                          payload: { name: "entityId", value: selectedValue },
                        });
                        dispatch({
                          type: actionTypes.SET_SELECTED_ENTITY,
                          payload: { entityId: selectedValue, selectedEntityName: selectedEntity?.name || "" },
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="w-1/2">
                    <InputSelect
                      name="Graph Width"
                      title="Graph Width"
                      value={state.formData.graphWidth}
                      options={
                        state.formData.visualizationType === "stat chart"
                          ? [
                            { name: "100%", value: "100" },
                            { name: "75%", value: "75" },
                            { name: "50%", value: "50" },
                            { name: "25%", value: "25" },
                          ]
                          : [
                            { name: "100%", value: "100" },
                            { name: "50%", value: "50" },
                          ]
                      }
                      setValue={(val) =>
                        dispatch({
                          type: actionTypes.SET_FORM_DATA,
                          payload: { name: "graphWidth", value: val },
                        })
                      }
                      placeholder="Select Graph Width"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex w-full gap-4">
                  <div className="w-1/2">
                    <InputSelect
                      name="groupSlug"
                      title="GroupSlug"
                      required={true}
                      value={state.formData.groupSlug}
                      placeholder="Select GroupSlug"
                      options={
                        groups?.map((group: any) => ({
                          name: group.slug,
                          value: group.slug,
                        })) || []
                      }
                      setValue={(selectedSlug) => {
                        dispatch({
                          type: actionTypes.SET_FORM_DATA,
                          payload: { name: "groupSlug", value: selectedSlug },
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="w-1/2">
                    <InputText
                      type="text"
                      name="entitySlug"
                      title="EntitySlug"
                      value={state.formData.entitySlug}
                      setValue={(val) =>
                        dispatch({
                          type: actionTypes.SET_FORM_DATA,
                          payload: { name: "entitySlug", value: val },
                        })
                      }
                      placeholder="EntitySlug"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
            {activeModule === "advanced" && (
              <div className="bg-white-50 mx-auto max-w-4xl rounded-lg p-4">
                <h3 className="mb-2 text-base font-bold text-[#180505]">Additional Details</h3>
                <hr className="mb-3 h-0.5" />
                <div className="flex w-full gap-4">
                  <div className="w-1/2">
                    {state.formData.visualizationType !== "stat chart" ? (
                      <InputSelect
                        name="groupBy"
                        title="Group By"
                        required={true}
                        value={state.formData.groupBy.length > 0 ? state.formData.groupBy[0].property : ""}
                        options={state.entityProperties
                          .filter(
                            (prop: any) =>
                              prop.name !== "id" && prop.name !== "folio" && (getInputType(prop.type) === "date" || getInputType(prop.type) === "select")
                          )
                          .map((prop: any) => ({
                            value: prop.name,
                            name: prop.name,
                          }))}
                        setValue={(selectedValue) => {
                          const existing = state.entityProperties.find((g: any) => g.name === selectedValue);
                          const updatedGroupBy = existing ? [{ property: selectedValue, type: getInputType(existing.type), propertyId: existing.id }] : [];

                          dispatch({ type: actionTypes.SET_GROUP_BY, payload: updatedGroupBy });
                          dispatch({ type: actionTypes.SET_METRICS, payload: [] });
                        }}
                        placeholder="Select group by property"
                        className="w-full"
                        disabled={state.formData.visualizationType === "stat chart"}
                      />
                    ) : (
                      <InputCombobox
                        name="category"
                        title="Metrics"
                        withSearch={false}
                        // required={true}
                        value={state.formData.metrics.map((group: any) => group.property)}
                        options={state.entityProperties
                          .filter((prop: any) => prop.type === 0 && prop.name !== "id" && prop.name !== "folio")
                          .map((prop: any) => ({
                            value: prop.name,
                            name: prop.name,
                          }))}
                        onChange={(selectedValues) => {
                          const updatedMetrics = selectedValues.map((property: any) => {
                            const existing = state.entityProperties.find((g: any) => g.name === property);
                            return { property, name: existing ? existing.name : property, operation: "count", propertyId: existing.id };
                          });
                          dispatch({ type: actionTypes.SET_GROUP_BY, payload: [] });
                          dispatch({ type: actionTypes.SET_METRICS, payload: updatedMetrics });
                        }}
                        selectPlaceholder="Select a metrics"
                        className="w-full rounded border p-2"
                        disabled={state.formData.visualizationType === "bar chart" || state.formData.visualizationType === "pie chart"}
                      />
                    )}
                  </div>

                  <div className="w-1/2">
                    <InputSelect
                      name="timeGranularity"
                      title="Time Granularity"
                      value={state.formData.timeGranularity}
                      options={[
                        { name: "One Week", value: "one_week" },
                        { name: "One Month", value: "one_month" },
                        { name: "One Year", value: "one_year" },
                      ]}
                      setValue={(val) =>
                        dispatch({
                          type: actionTypes.SET_FORM_DATA,
                          payload: { name: "timeGranularity", value: val },
                        })
                      }
                      placeholder="Select Time Granularity"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="mt-2 space-y-4">
                  <div className="text-label max-h-[250px] overflow-auto rounded-lg bg-gray-50 text-sm">
                    <div className="mb-2 flex items-center gap-2">
                      Filters
                      <button
                        type="button"
                        className="hover:text-accent-foreground hover:bg-accent rounded-md px-2 py-1 text-sm font-semibold leading-[19px]"
                        onClick={() => dispatch({ type: actionTypes.ADD_FILTER, payload: "" })}
                      >
                        +ADD
                      </button>
                    </div>
                    {state.formData.filters.length === 0 ? (
                      <div className="flex items-center justify-center p-2 text-lg italic text-red-500">No Filters</div>
                    ) : (
                      state.formData.filters.map((filter: any, index: number) => {
                        const selectedProp = state.entityProperties.find((prop: any) => prop.name === filter.field);
                        const inputType = selectedProp ? getInputType(selectedProp.type) : "text";

                        return (
                          <div key={index} className="flex w-full items-center gap-4 py-1">
                            <InputSelect
                              name={`filterField-${index}`}
                              value={filter.field}
                              placeholder="select field"
                              options={state.entityProperties
                                .filter((prop: any) => prop.name !== "id" && prop.name !== "folio")
                                .map((prop: any) => ({
                                  name: prop.name,
                                  value: prop.name,
                                }))}
                              setValue={(field) => {
                                const selectedProp = state.entityProperties.find((prop: any) => prop.name === field);
                                dispatch({
                                  type: actionTypes.SET_FILTER_FIELD,
                                  payload: { index, field, fieldId: selectedProp ? selectedProp.id : "" },
                                });
                              }}
                              className="w-5/12"
                            />
                            <InputSelect
                              name={`filterOperator-${index}`}
                              value={filter.operator}
                              withSearch={false}
                              options={
                                inputType !== "text"
                                  ? [
                                    { name: "=", value: "=" },
                                    { name: ">", value: ">" },
                                    { name: "<", value: "<" },
                                  ]
                                  : [{ name: "=", value: "=" }]
                              }
                              setValue={(operator) =>
                                dispatch({
                                  type: actionTypes.SET_FILTER_OPERATOR,
                                  payload: { index, operator },
                                })
                              }
                              className="w-20 text-lg "
                            />
                            <div className="w-5/12">
                              {selectedProp?.options?.length ? (
                                <InputSelect
                                  name={`filterValue-${index}`}
                                  value={filter.value}
                                  options={selectedProp.options.map((opt: any) => ({
                                    name: opt.value,
                                    value: opt.value,
                                  }))}
                                  setValue={(value) =>
                                    dispatch({
                                      type: actionTypes.SET_FILTER_VALUE,
                                      payload: { index, value },
                                    })
                                  }
                                  className="w-full "
                                />
                              ) : inputType === "textarea" ? (
                                <Textarea
                                  className="w-full resize-none "
                                  placeholder="Enter value"
                                  value={filter.value}
                                  onChange={(e) =>
                                    dispatch({
                                      type: actionTypes.SET_FILTER_VALUE,
                                      payload: { index, value: e.target.value },
                                    })
                                  }
                                />
                              ) : inputType === "checkbox" ? (
                                <div className="flex items-center space-x-4">
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      name={`filterValue-${index}`}
                                      value="true"
                                      checked={filter.value === "true"}
                                      onChange={() =>
                                        dispatch({
                                          type: actionTypes.SET_FILTER_VALUE,
                                          payload: { index, value: "true" },
                                        })
                                      }
                                    />
                                    <span>True</span>
                                  </label>
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      name={`filterValue-${index}`}
                                      value="false"
                                      checked={filter.value === "false"}
                                      onChange={() =>
                                        dispatch({
                                          type: actionTypes.SET_FILTER_VALUE,
                                          payload: { index, value: "false" },
                                        })
                                      }
                                    />
                                    <span>False</span>
                                  </label>
                                </div>
                              ) : (
                                <InputText
                                  type={inputType}
                                  name={`filterValue-${index}`}
                                  value={filter.value}
                                  setValue={(value) =>
                                    dispatch({
                                      type: actionTypes.SET_FILTER_VALUE,
                                      payload: { index, value },
                                    })
                                  }
                                  placeholder="Value"
                                />
                              )}
                            </div>

                            <button type="button" className="text-black" onClick={() => dispatch({ type: actionTypes.REMOVE_FILTER, payload: index })}>
                              ✖
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="mt-2 space-y-4">
                  <div className="text-label max-h-[250px] overflow-auto rounded-lg bg-gray-50 text-sm">
                    <div className="mb-2 flex items-center gap-2">
                      Computed Fields
                      <button
                        type="button"
                        className="hover:text-accent-foreground hover:bg-accent rounded-md px-2 py-1 text-sm font-semibold leading-[19px]"
                        onClick={() => dispatch({ type: actionTypes.ADD_COMPUTED_FIELD, payload: "" })}
                      >
                        +ADD
                      </button>
                    </div>
                    {state.formData.computedFields.length === 0 ? (
                      <div className="flex items-center justify-center p-2 text-lg italic text-red-500">No Computed Fields</div>
                    ) : (
                      state.formData.computedFields.map((computedField: any, index: number) => {
                        return (
                          <div key={index} className="flex w-full items-center gap-4 py-1">
                            <InputSelect
                              name={`computedFieldA-${index}`}
                              value={computedField.field_a}
                              placeholder="Select Field A"
                              options={state.entityProperties
                                .filter((prop: any) => prop.type === 0 && prop.name !== "id" && prop.name !== "folio")
                                .map((prop: any) => ({ name: prop.name, value: prop.name }))}
                              setValue={(field_a) => {
                                const selectedProp = state.entityProperties.find((prop: any) => prop.name === field_a);
                                dispatch({
                                  type: actionTypes.SET_COMPUTED_FIELD_A,
                                  payload: { index, field_a, field_a_id: selectedProp?.id },
                                });
                              }}
                              className="w-5/12"
                            />

                            <InputSelect
                              name={`filterOperator-${index}`}
                              value={computedField.operator}
                              withSearch={false}
                              options={[
                                { name: "+", value: "+" },
                                { name: "-", value: "-" },
                                { name: "*", value: "*" },
                                { name: "/", value: "/" },
                              ]}
                              setValue={(operator) =>
                                dispatch({
                                  type: actionTypes.SET_COMPUTED_OPERATOR,
                                  payload: { index, operator },
                                })
                              }
                              className="w-20 text-lg"
                            />

                            <InputSelect
                              name={`computedFieldB-${index}`}
                              value={computedField.field_b}
                              placeholder="Select Field B"
                              options={state.entityProperties
                                .filter((prop: any) => prop.type === 0 && prop.name !== "id" && prop.name !== "folio")
                                .map((prop: any) => ({ name: prop.name, value: prop.name }))}
                              setValue={(field_b) => {
                                const selectedProp = state.entityProperties.find((prop: any) => prop.name === field_b);
                                dispatch({
                                  type: actionTypes.SET_COMPUTED_FIELD_B,
                                  payload: { index, field_b, field_b_id: selectedProp?.id },
                                });
                              }}
                              className="w-5/12"
                            />

                            <button type="button" className="text-black" onClick={() => dispatch({ type: actionTypes.REMOVE_COMPUTED_FIELD, payload: index })}>
                              ✖
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className={`absolute bottom-5 right-5 self-end rounded-lg bg-black px-4 py-2 text-white`}
          >
            Submit
          </button>
        </div>
      </Form>
    </div>
  );
};

export default DynamicGraphForm;