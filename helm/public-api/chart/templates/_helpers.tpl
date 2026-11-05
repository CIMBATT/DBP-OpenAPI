{{- define "cimbatt-public-api.fullname" -}}
{{- printf "%s-public-api" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "cimbatt-public-api.configName" -}}
{{- printf "%s-config" (include "cimbatt-public-api.fullname" . | trunc 56 | trimSuffix "-") -}}
{{- end -}}

{{- define "cimbatt-public-api.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: public-api
{{- end -}}

{{- define "cimbatt-public-api.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{ include "cimbatt-public-api.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}
