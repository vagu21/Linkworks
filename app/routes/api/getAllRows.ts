import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { getProperty } from "~/utils/db/entities/properties.db.server"; // Import the getProperty function

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const entity = url.searchParams.get("entity");
    const trigger = url.searchParams.get("trigger");

    // Fetch rows from the RowsApi
    const response = await RowsApi.getAll({
      entity: { name: "Actions" },
      tenantId: null,
      rowWhere: {
        AND: [
          {
            values: {
              some: {
                property: {
                  name: "entityName",
                },
                textValue: entity,
              },
            },
          },
          {
            values: {
              some: {
                property: {
                  name: "triggers",
                },
                textValue: trigger,
              },
            },
          },
        ],
      },
    });

    // Fetch property details for each row using propertyId and add propertyName to each value
    const rowsWithPropertyDetails = await Promise.all(
      response?.items?.map(async (row) => {
        // Map through the row values and fetch property details for each value
        const updatedValues = await Promise.all(
          row.values?.map(async (value: any) => {
            const propertyId = value.propertyId;

            // If propertyId exists, fetch the property details
            if (propertyId) {
              const property = await getProperty(propertyId);
              // Attach the property name to the value
              return {
                ...value,
                propertyName: property?.name || "Unknown", // Assuming `name` is the property name
              };
            }

            return value; // If no propertyId, return value as is
          })
        );

        return {
          ...row,
          values: updatedValues, // Update values with property names
        };
      }) || []
    );

    return json({ items: rowsWithPropertyDetails || [] });
  } catch (error) {
    console.error("Failed to fetch rows:", error);
    return json({ items: [], error: "Internal Server Error" }, { status: 500 });
  }
};
